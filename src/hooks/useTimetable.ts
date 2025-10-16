import { useContext } from "react";
import { AppContext, TimetableItem } from "../context/AppContext";
import { AddTimeEntry, membershipAPI } from "../api";

function insertIntoTimetable(
  list: TimetableItem[],
  item: TimetableItem
): TimetableItem[] {
  if (!list || list.length === 0) return [item];
  const date = item.date;
  // Find the same date
  const start = list.findIndex((e) => e.date === date);
  if (start === -1) return [...list, item];
  let end = start;
  while (end < list.length && list[end].date === date) end++;
  // Find the index to insert
  let idx = start;
  const newTs = Number(item.ts ?? 0);
  while (idx < end && Number(list[idx].ts ?? 0) >= newTs) idx++;
  // Build the new list
  return [...list.slice(0, idx), item, ...list.slice(idx)];
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
      updateState({ timetable: insertIntoTimetable(timetable, data) });
    }
    return data;
  }

  return { timetable, isLoading: timetableLoading, getTime, addTime };
}
