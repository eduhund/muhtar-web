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
    const { data } = await membershipAPI.bookResource(entry);
    if (data) {
      // Always refresh from server after mutation
      const fresh = await membershipAPI.getBookedResources({});
      updateState({ bookedResources: fresh?.data || [] });
    }
    return data;
  }

  async function updateBookedResource(entry: { id: string; value: number }) {
    const { OK } = await membershipAPI.updateBookedResource(entry);
    if (OK) {
      const fresh = await membershipAPI.getBookedResources({});
      updateState({ bookedResources: fresh?.data || [] });
    }
    return OK;
  }

  async function resetBookedResource(entry: { id: string }) {
    const { OK } = await membershipAPI.resetBookedResource(entry);
    if (OK) {
      const fresh = await membershipAPI.getBookedResources({});
      updateState({ bookedResources: fresh?.data || [] });
    }
    return OK;
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
