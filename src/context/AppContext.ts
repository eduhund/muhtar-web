import { createContext } from "react";

type Connection = {
  [key: string]: string;
};

type ConnectionList = {
  [key: string]: Connection;
};

type AccessRole = "admin" | "manager" | "member" | "guest";

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
  name: string;
  status: "invited" | "pending" | "active" | "archived";
  accessRole: AccessRole;
  contract: {
    name: string;
    from: string; // YYYY-MM-DD
    to: string | null; // YYYY-MM-DD | null
    type: ContractType;
    rate: Rate | null;
    status: "active" | "expired" | "terminated";
  }[];
  connecttions: ConnectionList;
  team?: { id: string; name: string } | null;
}

export interface Task {
  id: string;
  name: string;
  team: { id: string; name: string };
  project: { id: string; name: string; customer: string | null };
  assignedMembership: { id: string; name: string } | null;
  jobId: string | null;
  startDate: string | null;
  dueDate: string | null;
  doneDate: string | null;
  duration: number | null; // in minutes
  notes: string;
  history: any[]; //HistoryRecord<Task, string>[];
  isDeleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  connections: ConnectionList;
  isDeleted: boolean;
}

export interface Project {
  id: string;
  name: string;
  customer: string | null;
  status: "active" | "archived";
  isDeleted: boolean;
  roles: {
    key: string;
    name: string;
    cost: number;
    currency: Currency;
  }[];
  memberships: {
    membershipId: string;
    accessRole: string;
    workRole: string;
    multiplier: number;
  }[];
}

export interface ProjectMembership {
  membershipId: string;
  accessRole: string;
  workRole: string;
  multiplier: number;
}

export interface TimetableItem {
  id: string;
  ts: number; // timestamp
  project: { id: string; name: string; customer: string | null };
  membership: { id: string; name: string };
  date: string; // YYYY-MM-DD
  duration: number; // in minutes
  comment: string;
  isDeleted: boolean;
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
  tasks?: Task[] | null;
  tasksLoading?: boolean;
  updateState: (state: Partial<AppContext>) => void;
}

export const AppContext = createContext<AppContext | undefined>(undefined);
