import { useContext } from "react";
import { AppContext, TimetableItem } from "../context/AppContext";
import { AddTimeEntry, membershipAPI, UpdateTimeEntry } from "../api";

function insertIntoTimetable(
  list: TimetableItem[],
  item: TimetableItem
): TimetableItem[] {
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

function updateTimetableItem(
  list: TimetableItem[],
  item: TimetableItem
): TimetableItem[] {
  const filteredList = list.filter((e) => e.id !== item.id);
  return insertIntoTimetable(filteredList, item);
}

export function useTimetable() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { timetable, timetableLoading, updateState } = context;

  async function getTime(query: { [key: string]: string }) {
    const data = await membershipAPI.getTime(query);
    return data;
  }

  async function addTime(entry: AddTimeEntry) {
    const { data } = await membershipAPI.addTime(entry);
    if (data && timetable) {
      const newtimetable = insertIntoTimetable(timetable, data);
      updateState({ timetable: newtimetable });
    }
    return data;
  }

  async function updateTime(entry: UpdateTimeEntry) {
    const { OK } = await membershipAPI.updateTime(entry);
    if (OK && timetable) {
      const entryRecord = timetable.find((item) => item.id === entry.id);
      if (entryRecord) {
        const newtimetable = updateTimetableItem(timetable, {
          ...entryRecord,
          ...entry,
        });
        updateState({ timetable: newtimetable });
      }
    }
    return OK;
  }

  async function updateResources(entries: UpdateTimeEntry[]) {
    if (!timetable) return { success: [], failed: entries.map((e) => e.id) };
    const results = await Promise.allSettled(
      entries.map((entry) => membershipAPI.updateTime(entry))
    );
    const successIds: string[] = [];
    const failedIds: string[] = [];
    let newTimetable = [...timetable];

    entries.forEach((entry, idx) => {
      const result = results[idx];
      if (result.status === "fulfilled" && result.value?.OK) {
        const entryRecord = newTimetable.find((item) => item.id === entry.id);
        if (entryRecord) {
          newTimetable = updateTimetableItem(newTimetable, {
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
      updateState({ timetable: newTimetable });
    }

    return { success: successIds, failed: failedIds };
  }

  async function deleteTime(entry: { id: string }) {
    const { OK } = await membershipAPI.deleteTime(entry);
    if (OK && timetable) {
      const entryRecord = timetable.find((item) => item.id === entry.id);
      if (entryRecord) {
        entryRecord.isDeleted = true;
        const newtimetable = updateTimetableItem(timetable, entryRecord);
        updateState({ timetable: newtimetable });
      }
    }
    return OK;
  }

  async function restoreTime(entry: { id: string }) {
    const { OK } = await membershipAPI.restoreTime(entry);
    if (OK && timetable) {
      const entryRecord = timetable.find((item) => item.id === entry.id);
      if (entryRecord) {
        entryRecord.isDeleted = false;
        const newtimetable = updateTimetableItem(timetable, entryRecord);
        updateState({ timetable: newtimetable });
      }
    }
    return OK;
  }

  return {
    timetable,
    isLoading: timetableLoading,
    getTime,
    addTime,
    updateTime,
    updateResources,
    deleteTime,
    restoreTime,
  };
}
