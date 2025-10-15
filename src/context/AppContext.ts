import { createContext } from "react";

type Connection = {
  [key: string]: string;
};

type ConnectionList = {
  [key: string]: Connection;
};

type AccessRole = "admin" | "user" | "guest";

type ContractType = "staff" | "freelance";

type RatePeriod = "hour" | "day" | "month";

type Currency = "USD" | "EUR" | "GBP" | "RUB" | string;

type Rate = {
  value: number;
  period: RatePeriod;
  currency: Currency;
};

/*
type HistoryRecord<T, K> = {
  ts: number;
  action: "create" | "update" | "archive" | "restore" | K;
  actorType: "user" | "system";
  actorId: string;
  change?: {
    [P in keyof T]: {
      oldValue: T[P];
      newValue: T[P];
    };
  };
};
*/

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Membership {
  id: string;
  status: "invited" | "pending" | "active" | "archived";
  accessRole: AccessRole;
  contract: {
    type: ContractType;
    rate: Rate | null;
    isActive: boolean;
  };
  connecttions: ConnectionList;
}

export interface Team {
  id: string;
  name: string;
  connections: ConnectionList;
  isArchived: boolean;
}

export interface Project {
  id: string;
  name: string;
  isArchived: boolean;
}

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

export interface AppContext {
  user: User | null;
  membership?: Membership | null;
  team?: Team | null;
  memberships?: Membership[] | null;
  projects?: Project[] | null;
  timetable?: Timetable | null;
  setUser: (user: User | null) => void;
  setMembership: (membership: Membership | null) => void;
  setProjects: (projects: Project[] | null) => void;
  setMemberships: (memberships: Membership[] | null) => void;
  setTeam: (team: Team | null) => void;
  setTimetable: (timetable: Timetable | null) => void;
}

export const AppContext = createContext<AppContext | undefined>(undefined);
