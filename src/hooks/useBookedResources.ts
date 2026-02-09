import { useContext } from "react";
import {
  AppContext,
  BookedResource,
  BookedResources,
} from "../context/AppContext";
import { membershipAPI } from "../api";

function insertIntoResources(
  list: BookedResources,
  item: BookedResource,
): BookedResources {
  if (!list || list.length === 0) return [item];
  const date = item.date;
  const start = list.findIndex((e) => e.date === date);
  if (start === -1) {
    const idx = list.findIndex((e) => e.date < date);
    if (idx === -1) return [...list, item];
    return [...list.slice(0, idx), item, ...list.slice(idx)];
  }
  let end = start;
  while (end < list.length && list[end].date === date) end++;
  return [...list.slice(0, start), item, ...list.slice(end)];
}

function updateResourceTable(
  list: BookedResources,
  item: BookedResource,
): BookedResources {
  const filteredList = list.filter((e) => e.id !== item.id);
  return insertIntoResources(filteredList, item);
}

export function useBookedResources() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { bookedResources, bookedResourcesLoading, updateState } = context;

  async function getBookedResources(query: { [key: string]: string }) {
    const data = await membershipAPI.getBookedResources(query);
    return data;
  }

  async function bookResource(entry: {
    projectId: string;
    date: string;
    period: string;
    resource: { type: "time"; value: number };
    target: { type: "worker" | "role"; id: string };
    comment?: string;
  }) {
    // Optimistic update: add temporary entry to local state
    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: BookedResource = {
      id: tempId,
      projectId: entry.projectId,
      date: entry.date,
      type: "time",
      resource: entry.resource,
      target: entry.target,
      comment: entry.comment || "",
      isDeleted: false,
    };

    const currentResources = bookedResources || [];
    updateState({
      bookedResources: insertIntoResources(currentResources, optimisticEntry),
    });

    try {
      // API expects inverted structure: resource is worker/role, target is time
      const { data } = await membershipAPI.bookResource({
        projectId: entry.projectId,
        date: entry.date,
        period: entry.period,
        resource: { type: entry.target.type, id: entry.target.id },
        target: { type: entry.resource.type, value: entry.resource.value },
        comment: entry.comment,
      });

      if (data) {
        // Replace temp entry with real one from server
        const fresh = await membershipAPI.getBookedResources({});
        updateState({
          bookedResources: (fresh?.data as BookedResources) || [],
        });
      }
      return data;
    } catch (error) {
      // Rollback on error
      updateState({ bookedResources: currentResources });
      throw error;
    }
  }

  async function updateBookedResource(entry: { id: string; value: number }) {
    const currentResources = bookedResources || [];
    const targetEntry = currentResources.find((e) => e.id === entry.id);

    if (!targetEntry) return false;

    // Optimistic update: update value in local state
    const optimisticEntry = {
      ...targetEntry,
      resource: { ...targetEntry.resource, value: entry.value },
    };

    updateState({
      bookedResources: updateResourceTable(currentResources, optimisticEntry),
    });

    try {
      const { OK } = await membershipAPI.updateBookedResource(entry);
      if (OK) {
        const fresh = await membershipAPI.getBookedResources({});
        updateState({
          bookedResources: (fresh?.data as BookedResources) || [],
        });
      }
      return OK;
    } catch (error) {
      // Rollback on error
      updateState({ bookedResources: currentResources });
      throw error;
    }
  }

  async function resetBookedResource(entry: { id: string }) {
    const currentResources = bookedResources || [];
    const targetEntry = currentResources.find((e) => e.id === entry.id);

    if (!targetEntry) return false;

    // Optimistic update: mark as deleted in local state
    const optimisticEntry = { ...targetEntry, isDeleted: true };

    updateState({
      bookedResources: updateResourceTable(currentResources, optimisticEntry),
    });

    try {
      const { OK } = await membershipAPI.resetBookedResource(entry);
      if (OK) {
        const fresh = await membershipAPI.getBookedResources({});
        updateState({
          bookedResources: (fresh?.data as BookedResources) || [],
        });
      }
      return OK;
    } catch (error) {
      // Rollback on error
      updateState({ bookedResources: currentResources });
      throw error;
    }
  }

  return {
    bookedResources,
    isLoading: bookedResourcesLoading,
    getBookedResources,
    bookResource,
    updateBookedResource,
    resetBookedResource,
  };
}
