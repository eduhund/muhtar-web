import { createContext } from "react";

export interface TimetableItem {
  id: string;
  name: string;
  email?: string;
}

export type Timetable = TimetableItem[];

export interface TimetableContextType {
  timetable: Timetable | null;
  setTimetable: (timetable: Timetable | null) => void;
}

export const TimetableContext = createContext<TimetableContextType | undefined>(
  undefined
);
