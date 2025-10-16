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
  team?: { id: string; name: string } | null;
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
  customer: string | null;
  isArchived: boolean;
  memberships: { membershipId: string; accessRole: string; workRole: string }[];
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
  userLoading?: boolean;
  membership?: Membership | null;
  membershipLoading?: boolean;
  team?: Team | null;
  teamLoading?: boolean;
  memberships?: Membership[] | null;
  membershipsLoading?: boolean;
  projects?: Project[] | null;
  projectsLoading?: boolean;
  timetable?: Timetable | null;
  timetableLoading?: boolean;
  updateState: (state: Partial<AppContext>) => void;
}

export const AppContext = createContext<AppContext | undefined>(undefined);
