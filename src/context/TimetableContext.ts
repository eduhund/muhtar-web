import { createContext } from "react";

export interface TimetableItem {
  id: string;
  ts: number; // timestamp
  project: { id: string; name: string };
  membership: { id: string; name: string };
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  comment: string;
}

export type Timetable = TimetableItem[];

export interface TimetableContextType {
  timetable: Timetable | null;
  isLoading: boolean;
  setTimetable: (timetable: Timetable | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const TimetableContext = createContext<TimetableContextType | undefined>(
  undefined
);
