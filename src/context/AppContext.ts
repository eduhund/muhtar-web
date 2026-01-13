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
  duration: number | [number, number] | null; // in minutes
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

export type ProjectPlanResource = {
  type: string;
  value: number;
};

export type ProjectPlanRole = {
  key: string;
  resources: ProjectPlanResource[];
};

export type ProjectPlanJob = {
  id: string;
  name: string;
  planStart: string;
  planEnd: string;
  status: "backlog" | "inProgress" | "completed" | "canceled";
  actualStart: string | null;
  actualEnd: string | null;
  totalBudget: number;
  totalResources: ProjectPlanResource[];
  outcomes?: any[];
  roles: ProjectPlanRole[];
  children: ProjectPlanJob[];
};

export type ProjectPlan = {
  planStart: string;
  planEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  totalBudget: number;
  totalResources: ProjectPlanResource[];
  roles: ProjectPlanRole[];
  jobs: ProjectPlanJob[];
};

type ProjectContract = {
  budget: { amount: number; currency: Currency };
  roles: {
    key: string;
    name: string;
    resources: {
      type: string;
      costPerUnit: {
        amount: number;
        currency: Currency;
      };
    }[];
  }[];
};

export interface Project {
  id: string;
  name: string;
  customer: string | null;
  status: "active" | "archived";
  isDeleted: boolean;
  memberships: {
    membershipId: string;
    accessRole: string;
    workRole: string;
    multiplier: number;
  }[];
  activeContract: ProjectContract | null;
  activePlan: ProjectPlan | null;
}

export interface ProjectMembership {
  membershipId: string;
  accessRole: string;
  workRole: string;
  multiplier: number;
}

export interface Resource {
  id: string;
  ts: number; // timestamp
  project: { id: string; name: string; customer: string | null };
  membership: { id: string; name: string };
  date: string; // YYYY-MM-DD
  type: string;
  target: { type: "task" | "job" | "other"; id: string } | null;
  consumed: number; // in minutes
  comment: string;
  isDeleted: boolean;
}

export type Resources = Resource[];

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
  resources?: Resources | null;
  resourcesLoading?: boolean;
  tasks?: Task[] | null;
  tasksLoading?: boolean;
  updateState: (state: Partial<AppContext>) => void;
}

export const AppContext = createContext<AppContext | undefined>(undefined);
