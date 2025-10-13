import { useState, ReactNode, useEffect } from "react";
import { Timetable, TimetableContext } from "../context/TimetableContext";
import { membershipAPI } from "../api";

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function initTimetable() {
    setIsLoading(true);
    const { data } = (await membershipAPI.getTimetable({
      from: "2025-10-01",
      to: "2025-10-10",
    })) as any;
    if (data) {
      setTimetable(data);
    } else {
      setTimetable(null);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    initTimetable();
  }, []);

  return (
    <TimetableContext.Provider
      value={{ timetable, isLoading, setTimetable, setIsLoading }}
    >
      {children}
    </TimetableContext.Provider>
  );
}
