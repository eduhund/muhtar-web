import { createContext } from "react";

export interface TimetableItem {
  id: string;
  name: string;
  email?: string;
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
