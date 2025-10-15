import { useContext } from "react";
import { Timetable, AppContext } from "../context/AppContext";
import { membershipAPI } from "../api";

export function useTimetable() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { timetable, setTimetable } = context;

  async function getTime(query: { [key: string]: string }) {
    const data = await membershipAPI.getTime(query);
    return data;
  }

  async function getTimetable(query: { [key: string]: string }) {
    const { data } = (await membershipAPI.getTimetable(query)) as {
      data: Timetable | null;
    };
    setTimetable(data || null);
  }

  return { timetable, getTime, getTimetable };
}
