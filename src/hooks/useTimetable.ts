import { useContext, useState } from "react";
import { Timetable, TimetableContext } from "../context/TimetableContext";
import { membershipAPI } from "../api";

export function useTimetable() {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }
  const { timetable, setTimetable } = context;

  async function getTime(query: { [key: string]: string }) {
    setIsLoading(true);
    const data = await membershipAPI.getTime(query);
    setIsLoading(false);
    return data;
  }

  async function getTimetable(query: { [key: string]: string }) {
    setIsLoading(true);
    const { data } = (await membershipAPI.getTimetable(query)) as {
      data: Timetable | null;
    };
    setIsLoading(false);
    setTimetable(data || null);
  }

  return { timetable, isLoading, getTime, getTimetable };
}
