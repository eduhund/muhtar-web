import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { membershipAPI } from "../api";

export function useTimetable() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a TimetableProvider");
  }

  const { timetable, timetableLoading } = context;

  async function getTime(query: { [key: string]: string }) {
    const data = await membershipAPI.getTime(query);
    return data;
  }

  return { timetable, isLoading: timetableLoading, getTime };
}
