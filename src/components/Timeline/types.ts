export interface Resource {
  type: string;
  value: number; // for "time" type, this is in minutes
}

export interface Role {
  key: string;
  resources: Resource[];
}

export type TaskStatus = "backlog" | "inProgress" | "completed" | "canceled";

export interface GanttItem {
  id: string;
  name: string;
  planStart?: string;
  planEnd?: string;
  prevJob?: string;
  tasks?: string[];
  roles?: Role[] | string[];
  status?: TaskStatus;
  jobs?: GanttItem[];
  // Actual data
  actualStartDate?: string;
  actualDueDate?: string;
  actualRoles?: Role[];
}

export interface FlatItem {
  id: string;
  name: string;
  planStart: Date;
  planEnd: Date;
  resources: Map<string, number>; // total minutes
  level: number;
  hasSubJobs: boolean;
  path: string;
  roles: Role[];
  status: TaskStatus;
  // Actual data
  actualStartDate?: Date;
  actualDueDate?: Date;
  actualResources?: Map<string, number>; // total actual minutes
  actualRoles?: Role[];
}

export type ViewMode = "day" | "week";

export interface TimelineWeek {
  start: Date;
  end: Date;
  weekNumber: number;
}

export interface BarDimensions {
  left: number;
  width: number;
  barHeight: number;
  rowHeight: number;
  actualBarHeight?: number; // Height based on actual resources
}

export interface StatusStyles {
  className: string;
  textClassName: string;
  stripeColor: string;
}
