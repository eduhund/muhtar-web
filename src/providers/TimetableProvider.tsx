import { useState, ReactNode } from "react";
import { Timetable, TimetableContext } from "../context/TimetableContext";

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [timetable, setTimetable] = useState<Timetable | null>(null);

  return (
    <TimetableContext.Provider value={{ timetable, setTimetable }}>
      {children}
    </TimetableContext.Provider>
  );
}
