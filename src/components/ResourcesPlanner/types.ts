export interface Resource {
  type: string;
  value: number; // for "time" type, this is in minutes
}

export interface Role {
  key: string; // role name (e.g., 'analyst', 'developer')
  resources: Resource[];
}

export interface ProjectAssignment {
  worker: string; // worker name
  role: string; // role key
  // Note: On a single project, one worker can only have one role
}

export type TaskStatus = "backlog" | "inProgress" | "completed" | "canceled";

export interface GanttItem {
  id: string;
  name: string;
  startDate?: string;
  dueDate?: string;
  prevJob?: string;
  tasks?: string[];
  roles?: Role[] | string[];
  assignments?: ProjectAssignment[]; // Workers assigned to this project
  status?: TaskStatus;
  children?: GanttItem[];
  // Actual data
  actualStartDate?: string;
  actualDueDate?: string;
  actualRoles?: Role[];
}

export interface FlatItem {
  id: string;
  name: string;
  startDate: Date;
  dueDate: Date;
  resources: Map<string, number>; // total minutes
  level: number;
  hasChildren: boolean;
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
