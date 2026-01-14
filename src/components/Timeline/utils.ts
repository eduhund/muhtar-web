import {
  GanttItem,
  FlatItem,
  Role,
  Resource,
  TaskStatus,
  StatusStyles,
} from "./types";

// Date utilities
export const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const getMonthName = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "long" });
};

export const getYear = (date: Date): string => {
  return date.getFullYear().toString();
};

export const getDay = (date: Date): string => {
  return date.getDate().toString();
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const isStartOfWeek = (date: Date): boolean => {
  return date.getDay() === 1; // Monday
};

export const isStartOfMonth = (date: Date): boolean => {
  return date.getDate() === 1;
};

export const isStartOfYear = (date: Date): boolean => {
  return date.getMonth() === 0 && date.getDate() === 1;
};

export const isCurrentDay = (date: Date, currentDate: Date): boolean => {
  return date.toDateString() === currentDate.toDateString();
};

export const isCurrentWeek = (
  weekStart: Date,
  weekEnd: Date,
  currentDate: Date
): boolean => {
  return currentDate >= weekStart && currentDate <= weekEnd;
};

// Formatting utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatDuration = (minutes: number): string => {
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
};

export const formatWeekRange = (start: Date, end: Date): string => {
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startStr} - ${endStr}`;
};

export const formatStatus = (status: TaskStatus): string => {
  const statusMap = {
    backlog: "Backlog",
    inProgress: "In Progress",
    completed: "Completed",
    canceled: "Canceled",
  };
  return statusMap[status];
};

export const hasMonthChange = (start: Date, end: Date): boolean => {
  return start.getMonth() !== end.getMonth();
};

export const hasYearChange = (start: Date, end: Date): boolean => {
  return start.getFullYear() !== end.getFullYear();
};

export const calculateWorkingDays = (
  planStart: Date,
  planEnd: Date
): number => {
  let workingDays = 0;
  const currentDate = new Date(planStart);

  while (currentDate < planEnd) {
    if (!isWeekend(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays || 1;
};

// Resource calculation
export const calculateMetrics = (
  item: GanttItem
): {
  planStart: Date;
  planEnd: Date;
  resources: Map<string, number>;
  roles: Role[];
  actualStartDate?: Date;
  actualDueDate?: Date;
  actualResources?: Map<string, number>;
  actualRoles?: Role[];
} => {
  if (!item.children || item.children.length === 0) {
    // Leaf node
    const itemRoles = item.roles || [];
    const roles: Role[] = [];
    const resources = new Map<string, number>();

    // Filter and process only properly structured roles
    itemRoles.forEach((role) => {
      if (typeof role === "string") {
        return;
      }
      if (
        role &&
        typeof role === "object" &&
        "key" in role &&
        Array.isArray(role.resources)
      ) {
        roles.push(role);
        role.resources.forEach((resource) => {
          if (
            resource &&
            typeof resource === "object" &&
            "type" in resource &&
            "value" in resource
          ) {
            const current = resources.get(resource.type) || 0;
            resources.set(resource.type, current + resource.value);
          }
        });
      }
    });

    // Process actual data if present
    let actualStartDate: Date | undefined;
    let actualDueDate: Date | undefined;
    let actualResources: Map<string, number> | undefined;
    let actualRoles: Role[] | undefined;

    if (item.actualStartDate || item.actualDueDate || item.actualRoles) {
      if (item.actualStartDate) {
        actualStartDate = new Date(item.actualStartDate);
      }
      if (item.actualDueDate) {
        actualDueDate = new Date(item.actualDueDate);
      }
      if (item.actualRoles) {
        actualRoles = [];
        actualResources = new Map<string, number>();
        item.actualRoles.forEach((role) => {
          if (
            role &&
            typeof role === "object" &&
            "key" in role &&
            Array.isArray(role.resources)
          ) {
            actualRoles!.push(role);
            role.resources.forEach((resource) => {
              if (
                resource &&
                typeof resource === "object" &&
                "type" in resource &&
                "value" in resource
              ) {
                const current = actualResources!.get(resource.type) || 0;
                actualResources!.set(resource.type, current + resource.value);
              }
            });
          }
        });
      }
    }

    return {
      planStart: new Date(item.planStart!),
      planEnd: new Date(item.planEnd!),
      resources,
      roles,
      actualStartDate,
      actualDueDate,
      actualResources,
      actualRoles,
    };
  } else {
    // Parent node - aggregate from children
    const childMetrics = item.children.map(calculateMetrics);
    const planStart = new Date(
      Math.min(...childMetrics.map((m) => m.planStart.getTime()))
    );
    const planEnd = new Date(
      Math.max(...childMetrics.map((m) => m.planEnd.getTime()))
    );

    // Aggregate resources from all children
    const resources = new Map<string, number>();
    childMetrics.forEach((cm) => {
      cm.resources.forEach((value, type) => {
        const current = resources.get(type) || 0;
        resources.set(type, current + value);
      });
    });

    // Aggregate roles from all children
    const rolesMap = new Map<string, Role>();
    childMetrics.forEach((cm) => {
      cm.roles.forEach((role) => {
        const existingRole = rolesMap.get(role.key);
        if (existingRole) {
          const resourcesMap = new Map<string, number>();
          existingRole.resources.forEach((r) => {
            resourcesMap.set(r.type, r.value);
          });
          role.resources.forEach((r) => {
            const current = resourcesMap.get(r.type) || 0;
            resourcesMap.set(r.type, current + r.value);
          });
          existingRole.resources = Array.from(resourcesMap.entries()).map(
            ([type, value]) => ({
              type,
              value,
            })
          );
        } else {
          rolesMap.set(role.key, {
            key: role.key,
            resources: [...role.resources],
          });
        }
      });
    });

    const roles: Role[] = Array.from(rolesMap.values());

    // Aggregate actual data if any children have it
    let actualStartDate: Date | undefined;
    let actualDueDate: Date | undefined;
    let actualResources: Map<string, number> | undefined;
    let actualRoles: Role[] | undefined;

    const childrenWithActuals = childMetrics.filter(
      (cm) => cm.actualStartDate || cm.actualDueDate || cm.actualResources
    );

    if (childrenWithActuals.length > 0) {
      const actualStartDates = childMetrics
        .map((cm) => cm.actualStartDate)
        .filter((d): d is Date => d !== undefined);
      if (actualStartDates.length > 0) {
        actualStartDate = new Date(
          Math.min(...actualStartDates.map((d) => d.getTime()))
        );
      }

      // Only set actualDueDate if parent is completed or canceled
      // For inProgress parents, we should not show actualDueDate
      const actualDueDates = childMetrics
        .map((cm) => cm.actualDueDate)
        .filter((d): d is Date => d !== undefined);
      if (
        actualDueDates.length > 0 &&
        (item.status === "completed" || item.status === "canceled")
      ) {
        actualDueDate = new Date(
          Math.max(...actualDueDates.map((d) => d.getTime()))
        );
      }

      // Aggregate actual resources
      actualResources = new Map<string, number>();
      childMetrics.forEach((cm) => {
        if (cm.actualResources) {
          cm.actualResources.forEach((value, type) => {
            const current = actualResources!.get(type) || 0;
            actualResources!.set(type, current + value);
          });
        }
      });

      // Aggregate actual roles
      const actualRolesMap = new Map<string, Role>();
      childMetrics.forEach((cm) => {
        if (cm.actualRoles) {
          cm.actualRoles.forEach((role) => {
            const existingRole = actualRolesMap.get(role.key);
            if (existingRole) {
              const resourcesMap = new Map<string, number>();
              existingRole.resources.forEach((r) => {
                resourcesMap.set(r.type, r.value);
              });
              role.resources.forEach((r) => {
                const current = resourcesMap.get(r.type) || 0;
                resourcesMap.set(r.type, current + r.value);
              });
              existingRole.resources = Array.from(resourcesMap.entries()).map(
                ([type, value]) => ({
                  type,
                  value,
                })
              );
            } else {
              actualRolesMap.set(role.key, {
                key: role.key,
                resources: [...role.resources],
              });
            }
          });
        }
      });

      if (actualRolesMap.size > 0) {
        actualRoles = Array.from(actualRolesMap.values());
      }
    }

    return {
      planStart,
      planEnd,
      resources,
      roles,
      actualStartDate,
      actualDueDate,
      actualResources,
      actualRoles,
    };
  }
};

// Status utilities
export const getStatusStyles = (
  status: TaskStatus,
  isVisualLeaf: boolean
): StatusStyles => {
  let baseColor: string;

  if (isVisualLeaf) {
    if (status === "backlog") {
      baseColor = "timeline-bar-backlog";
    } else if (status === "inProgress") {
      baseColor = "timeline-bar-in-progress";
    } else if (status === "completed") {
      baseColor = "timeline-bar-completed";
    } else {
      baseColor = "timeline-bar-canceled";
    }
  } else {
    baseColor = "timeline-bar-parent";
  }

  let stripeColor = "";
  if (status === "backlog") {
    stripeColor = "timeline-stripe-backlog";
  } else if (status === "inProgress") {
    stripeColor = "timeline-stripe-in-progress";
  } else if (status === "completed") {
    stripeColor = "timeline-stripe-completed";
  } else if (status === "canceled") {
    stripeColor = "timeline-stripe-canceled";
  }

  const opacity =
    status === "completed" ? "timeline-bar-completed-opacity" : "";

  return {
    className: `timeline-bar ${baseColor} ${opacity}`,
    textClassName:
      status === "canceled"
        ? "timeline-text-canceled"
        : "timeline-text-default",
    stripeColor,
  };
};

export const getStatusBadgeClass = (status: TaskStatus): string => {
  if (status === "completed") {
    return "timeline-badge timeline-badge-completed";
  }
  if (status === "inProgress") {
    return "timeline-badge timeline-badge-in-progress";
  }
  if (status === "canceled") {
    return "timeline-badge timeline-badge-canceled";
  }
  return "timeline-badge timeline-badge-backlog";
};

// Data flattening
export const flattenData = (
  items: GanttItem[],
  collapsedItems: Set<string>,
  level = 0,
  path = ""
): FlatItem[] => {
  const result: FlatItem[] = [];

  items.forEach((item, index) => {
    const itemPath = path ? `${path}.${index}` : `${index}`;
    const metrics = calculateMetrics(item);

    result.push({
      id: item.id,
      name: item.name,
      planStart: metrics.planStart,
      planEnd: metrics.planEnd,
      resources: metrics.resources,
      level,
      hasChildren: !!item.children && item.children.length > 0,
      path: itemPath,
      roles: metrics.roles,
      status: item.status || "backlog",
      actualStartDate: metrics.actualStartDate,
      actualDueDate: metrics.actualDueDate,
      actualResources: metrics.actualResources,
      actualRoles: metrics.actualRoles,
    });

    if (
      item.children &&
      item.children.length > 0 &&
      !collapsedItems.has(item.id)
    ) {
      result.push(
        ...flattenData(item.children, collapsedItems, level + 1, itemPath)
      );
    }
  });

  return result;
};

// Row height calculation
export const getRowHeight = (
  resources: Map<string, number>,
  hasChildren: boolean,
  isCollapsed: boolean,
  maxDuration: number,
  actualResources?: Map<string, number>
): { rowHeight: number; barHeight: number; actualBarHeight?: number } => {
  const minHeight = 40;
  const maxHeight = 120;

  if (hasChildren && !isCollapsed) {
    return { rowHeight: minHeight, barHeight: minHeight };
  }

  if (maxDuration === 0) {
    return { rowHeight: minHeight, barHeight: minHeight };
  }

  // Calculate planned bar height
  const plannedTime = resources.get("time") || 0;
  const plannedRatio = plannedTime / maxDuration;
  const barHeight = minHeight + (maxHeight - minHeight) * plannedRatio;

  // Calculate actual bar height if actual data exists
  let actualBarHeight: number | undefined;
  let rowHeight = barHeight;

  if (actualResources && plannedTime > 0) {
    const actualTime = actualResources.get("time") || 0;
    // Calculate actual height proportionally to planned height
    // This ensures visual differences are clear
    const resourceRatio = actualTime / plannedTime;
    actualBarHeight = barHeight * resourceRatio;

    // Row height should accommodate the larger of planned or actual
    rowHeight = Math.max(barHeight, actualBarHeight);
  }

  return { rowHeight, barHeight, actualBarHeight };
};
