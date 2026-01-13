import { useContext } from "react";
import { AppContext, Resource } from "../context/AppContext";
import { AddResourceEntry, membershipAPI, UpdateResourceEntry } from "../api";

function insertIntoResources(list: Resource[], item: Resource): Resource[] {
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
  let idx = start;
  const newTs = Number(item.ts ?? 0);
  while (idx < end && Number(list[idx].ts ?? 0) >= newTs) idx++;
  return [...list.slice(0, idx), item, ...list.slice(idx)];
}

function updateResourceTable(list: Resource[], item: Resource): Resource[] {
  const filteredList = list.filter((e) => e.id !== item.id);
  return insertIntoResources(filteredList, item);
}

export function useResources() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { resources, resourcesLoading, updateState } = context;

  async function getResource(query: { [key: string]: string }) {
    const data = await membershipAPI.getResources(query);
    return data;
  }

  async function spendResource(entry: AddResourceEntry) {
    const { data } = await membershipAPI.spendResource(entry);
    if (data && resources) {
      const newResources = insertIntoResources(resources, data);
      updateState({ resources: newResources });
    }
    return data;
  }

  async function updateResource(entry: UpdateResourceEntry) {
    const { OK } = await membershipAPI.updateResource(entry);
    if (OK && resources) {
      const entryRecord = resources.find((item) => item.id === entry.id);
      if (entryRecord) {
        const newResources = updateResourceTable(resources, {
          ...entryRecord,
          ...entry,
        });
        updateState({ resources: newResources });
      }
    }
    return OK;
  }

  async function updateResources(entries: UpdateResourceEntry[]) {
    if (!resources) return { success: [], failed: entries.map((e) => e.id) };
    const results = await Promise.allSettled(
      entries.map((entry) => membershipAPI.updateResource(entry))
    );
    const successIds: string[] = [];
    const failedIds: string[] = [];
    let newResources = [...resources];
    entries.forEach((entry, idx) => {
      const result = results[idx];
      if (result.status === "fulfilled" && result.value?.OK) {
        const entryRecord = newResources.find((item) => item.id === entry.id);
        if (entryRecord) {
          newResources = updateResourceTable(newResources, {
            ...entryRecord,
            ...entry,
          });
          successIds.push(entry.id);
        }
      } else {
        failedIds.push(entry.id);
      }
    });

    if (successIds.length) {
      updateState({ resources: newResources });
    }

    return { success: successIds, failed: failedIds };
  }

  async function deleteResource(entry: { id: string }) {
    const { OK } = await membershipAPI.deleteResource(entry);
    if (OK && resources) {
      const entryRecord = resources.find((item) => item.id === entry.id);
      if (entryRecord) {
        entryRecord.isDeleted = true;
        const newResources = updateResourceTable(resources, entryRecord);
        updateState({ resources: newResources });
      }
    }
    return OK;
  }

  async function restoreResource(entry: { id: string }) {
    const { OK } = await membershipAPI.restoreResource(entry);
    if (OK && resources) {
      const entryRecord = resources.find((item) => item.id === entry.id);
      if (entryRecord) {
        entryRecord.isDeleted = false;
        const newResources = updateResourceTable(resources, entryRecord);
        updateState({ resources: newResources });
      }
    }
    return OK;
  }

  return {
    resources,
    isLoading: resourcesLoading,
    getResource,
    spendResource,
    updateResource,
    updateResources,
    deleteResource,
    restoreResource,
  };
}
