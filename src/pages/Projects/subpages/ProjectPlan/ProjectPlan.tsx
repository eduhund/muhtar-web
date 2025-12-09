import { useMemo, useState } from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";

import "./ProjectPlan.scss";
import {
  ProjectPlan,
  ProjectPlanResource,
  ProjectPlanRole,
} from "../../../../context/AppContext";

interface GanttItem {
  id: string;
  name: string;
  planStart?: string;
  planEnd?: string;
  prevJob?: string;
  tasks?: string[];
  roles?: ProjectPlanRole[] | string[];
  children?: GanttItem[];
}

interface GanttChartProps {
  plan: ProjectPlan | null;
  dayWidth?: number;
}

interface FlatItem {
  id: string;
  name: string;
  planStart: Date;
  planEnd: Date;
  resources: number; // total minutes
  level: number;
  hasChildren: boolean;
  path: string;
  roles: ProjectPlanRole[]; // roles for this item
}

export default function Timeline({ plan, dayWidth = 40 }: GanttChartProps) {
  console.log("Rendering Timeline with plan:", plan);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const toggleCollapse = (itemId: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Calculate dates and duration recursively
  const calculateMetrics = (
    item: GanttItem
  ): {
    planStart: Date;
    planEnd: Date;
    resources: number;
    roles: ProjectPlanRole[];
  } => {
    if (!item.children || item.children.length === 0) {
      // Leaf node
      const roles = (item.roles as ProjectPlanRole[]) || [];
      const resources = roles.reduce(
        (sum, role) => sum + role.resources[0].value,
        0
      );
      return {
        planStart: new Date(item.planStart!),
        planEnd: new Date(item.planEnd!),
        resources,
        roles,
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
      const resources = childMetrics.reduce((sum, m) => sum + m.resources, 0);

      // Aggregate roles from all children
      const rolesMap = new Map<string, ProjectPlanResource>();
      childMetrics.forEach((cm) => {
        cm.roles.forEach((role) => {
          const current = rolesMap.get(role.key) || { type: "", value: 0 };
          rolesMap.set(role.key, {
            type: role.resources[0].type,
            value: current.value + role.resources[0].value,
          });
        });
      });

      const roles: ProjectPlanRole[] = Array.from(rolesMap.entries()).map(
        ([key, resources]) => ({
          key,
          resources: [resources],
        })
      );

      return { planStart, planEnd, resources, roles };
    }
  };

  // Flatten data for rendering
  const flattenData = (
    items: GanttItem[],
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
      });

      // Only include children if the item is not collapsed
      if (
        item.children &&
        item.children.length > 0 &&
        !collapsedItems.has(item.id)
      ) {
        result.push(...flattenData(item.children, level + 1, itemPath));
      }
    });

    return result;
  };

  const flatData = useMemo(
    () => flattenData(plan?.jobs || []),
    [plan, collapsedItems]
  );

  // Calculate timeline range
  const { minDate, maxDate } = useMemo(() => {
    if (flatData.length === 0) {
      return { minDate: new Date(), maxDate: new Date() };
    }
    const minDate = new Date(
      Math.min(...flatData.map((item) => item.planStart.getTime()))
    );
    const maxDate = new Date(
      Math.max(...flatData.map((item) => item.planEnd.getTime()))
    );
    return { minDate, maxDate };
  }, [flatData]);

  // Generate timeline days
  const timelineDays = useMemo(() => {
    const days: Date[] = [];
    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }, [minDate, maxDate]);

  // Calculate row height based on resources
  const getRowHeight = (
    resources: number,
    hasChildren: boolean,
    isCollapsed: boolean
  ): number => {
    const minHeight = 40;
    const maxHeight = 120;

    // If has children and is expanded (not collapsed), use minimum height
    if (hasChildren && !isCollapsed) {
      return minHeight;
    }

    // Otherwise, height is proportional to resources
    const maxDuration = Math.max(...flatData.map((item) => item.resources));
    if (maxDuration === 0) return minHeight;
    const ratio = resources / maxDuration;
    return minHeight + (maxHeight - minHeight) * ratio;
  };

  // Calculate bar dimensions
  const getBarDimensions = (item: FlatItem) => {
    const daysSinceStart = Math.floor(
      (item.planStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const resourcesDays =
      Math.ceil(
        (item.planEnd.getTime() - item.planStart.getTime()) /
          (1000 * 60 * 60 * 24)
      ) || 1;

    const left = daysSinceStart * dayWidth;
    const width = resourcesDays * dayWidth;

    // Bar height fills the entire row
    const isCollapsed = collapsedItems.has(item.id);
    const rowHeight = getRowHeight(
      item.resources,
      item.hasChildren,
      isCollapsed
    );
    const barHeight = rowHeight;

    return { left, width, barHeight, rowHeight };
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatDuration = (minutes: number): string => {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  const formatHours = (minutes: number): string => {
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  const calculateDays = (startDate: Date, dueDate: Date): number => {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate < dueDate) {
      if (!isWeekend(currentDate)) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays || 1;
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  const isStartOfWeek = (date: Date): boolean => {
    return date.getDay() === 1; // Monday
  };

  const isStartOfMonth = (date: Date): boolean => {
    return date.getDate() === 1;
  };

  const isStartOfYear = (date: Date): boolean => {
    return date.getMonth() === 0 && date.getDate() === 1;
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "long" });
  };

  const getYear = (date: Date): string => {
    return date.getFullYear().toString();
  };

  const getDay = (date: Date): string => {
    return date.getDate().toString();
  };

  // Current day indicator position
  const getCurrentDayPosition = (): number | null => {
    // Fixed current date: January 16, 2024
    const now = new Date("2024-01-16T12:00:00"); // You can adjust the time here

    if (now < minDate || now > maxDate) {
      return null; // Current day is outside the timeline
    }

    const daysSinceStart =
      (now.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const position = daysSinceStart * dayWidth;

    return position;
  };

  const currentDayPosition = getCurrentDayPosition();

  const isCurrentDay = (date: Date): boolean => {
    const now = new Date("2024-01-16T12:00:00");
    return date.toDateString() === now.toDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Single unified scroll area */}
      <div className="flex-1 overflow-auto" style={{ height: 600 }}>
        <div
          className="relative"
          style={{ minWidth: 256 + timelineDays.length * dayWidth }}
        >
          {/* Header */}
          <div className="flex border-b bg-white sticky top-0 z-20">
            <div className="w-64 flex-shrink-0 px-4 py-3 border-r bg-white sticky left-0 z-30">
              <span className="font-medium text-gray-700">
                Task Information
              </span>
            </div>
            <div
              className="flex bg-white"
              style={{ width: timelineDays.length * dayWidth }}
            >
              {timelineDays.map((day, index) => {
                const weekend = isWeekend(day);
                const startOfWeek = isStartOfWeek(day);
                const startOfMonth = isStartOfMonth(day);
                const startOfYear = isStartOfYear(day);
                const currentDay = isCurrentDay(day);

                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 border-r flex flex-col justify-end items-start pb-1 px-1 ${
                      weekend ? "bg-gray-100" : ""
                    }`}
                    style={{
                      width: dayWidth,
                      minHeight: 60,
                      boxShadow: currentDay
                        ? "inset 0 -1px 0 0 #ef4444"
                        : undefined,
                    }}
                  >
                    {startOfYear && (
                      <div className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                        {getMonthName(day)} {getYear(day)}
                      </div>
                    )}
                    {startOfMonth && !startOfYear && (
                      <div className="text-xs font-medium text-gray-700 whitespace-nowrap">
                        {getMonthName(day)}
                      </div>
                    )}
                    {startOfWeek && (
                      <div className="text-[10px] text-gray-600 whitespace-nowrap">
                        Week {getWeekNumber(day)}
                      </div>
                    )}
                    <div
                      className={`text-sm ${
                        weekend ? "text-gray-400" : "text-gray-800"
                      } ${currentDay ? "font-bold" : ""}`}
                    >
                      {getDay(day)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background grid and weekends */}
          <div
            className="absolute left-64 right-0 top-0 bottom-0 pointer-events-none"
            style={{ top: 80 }}
          >
            {/* Grid lines */}
            {timelineDays.map((_, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 border-r border-gray-200"
                style={{ left: index * dayWidth }}
              />
            ))}

            {/* Weekend overlays */}
            {timelineDays.map((day, index) => {
              if (!isWeekend(day)) return null;
              return (
                <div
                  key={`weekend-${index}`}
                  className="absolute top-0 bottom-0 bg-gray-200 opacity-30"
                  style={{ left: index * dayWidth, width: dayWidth }}
                />
              );
            })}

            {/* Current day indicator */}
            {currentDayPosition !== null && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-10"
                style={{ left: currentDayPosition, top: -60 }}
              >
                <div className="w-px h-full bg-red-500" />
              </div>
            )}
          </div>

          {/* Rows */}
          {flatData.map((item) => {
            const { left, width, barHeight, rowHeight } =
              getBarDimensions(item);
            const isCollapsed = collapsedItems.has(item.id);
            const days = calculateDays(item.planStart, item.planEnd);

            return (
              <div
                key={item.id}
                className="flex border-b border-gray-200"
                style={{ height: rowHeight }}
              >
                {/* Left panel - sticky */}
                <div
                  className="w-64 flex-shrink-0 px-2 border-r bg-white flex flex-col pt-1 justify-start sticky left-0 z-10"
                  style={{
                    paddingLeft: `${8 + item.level * 16}px`,
                  }}
                >
                  <div className="flex items-center">
                    {item.hasChildren && (
                      <button
                        onClick={() => toggleCollapse(item.id)}
                        className="mr-1 w-3 h-3 flex items-center justify-center text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        {isCollapsed ? <RightOutlined /> : <DownOutlined />}
                      </button>
                    )}
                    {!item.hasChildren && (
                      <div className="w-3 mr-1 flex-shrink-0" />
                    )}
                    <div
                      className={`truncate text-xs ${
                        item.hasChildren ? "font-medium" : ""
                      }`}
                    >
                      {item.name}
                    </div>
                  </div>
                  <div
                    className="text-[9px] text-gray-500"
                    style={{ paddingLeft: "16px" }}
                  >
                    {formatDate(item.planStart)} - {formatDate(item.planEnd)} •{" "}
                    {days}d • {formatDuration(item.resources)}
                  </div>
                </div>

                {/* Chart area */}
                <div
                  className="flex-1 bg-gray-50 relative"
                  style={{ minWidth: timelineDays.length * dayWidth }}
                >
                  <div className="relative h-full flex items-center">
                    <div
                      className={`absolute rounded transition-all cursor-pointer ${
                        item.hasChildren
                          ? "bg-blue-100 border border-blue-300"
                          : "bg-green-100 border border-green-300"
                      } ${hoveredItemId === item.id ? "shadow-lg" : ""}`}
                      style={{
                        left,
                        width,
                        height: barHeight,
                      }}
                      onMouseEnter={(e) => {
                        setHoveredItemId(item.id);
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => {
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseLeave={() => {
                        setHoveredItemId(null);
                      }}
                    >
                      <div className="absolute top-1 left-2 text-gray-700 pointer-events-none">
                        <div
                          className={`text-[10px] leading-tight ${
                            item.hasChildren ? "font-medium" : ""
                          }`}
                        >
                          {item.name}
                        </div>
                        <div className="text-[9px] text-gray-600 mt-0.5">
                          {formatDate(item.planStart)} -{" "}
                          {formatDate(item.planEnd)} • {days}d •{" "}
                          {formatDuration(item.resources)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItemId &&
        (() => {
          const hoveredItem = flatData.find(
            (item) => item.id === hoveredItemId
          );
          if (!hoveredItem || hoveredItem.roles.length === 0) return null;

          return (
            <div
              className="fixed bg-white border border-gray-300 rounded shadow-lg p-3 z-50 pointer-events-none"
              style={{
                left: tooltipPosition.x + 15,
                top: tooltipPosition.y + 15,
                maxWidth: "250px",
              }}
            >
              <div className="font-medium text-sm text-gray-800 mb-2">
                {hoveredItem.name}
              </div>
              <div className="text-xs text-gray-600 mb-2">
                Resources breakdown:
              </div>
              <div className="space-y-1">
                {hoveredItem.roles.map((role, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-700">{role.key}:</span>
                    <span className="font-medium text-gray-900">
                      {formatHours(role.resources[0].value)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-xs">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="font-semibold text-gray-900">
                  {formatHours(
                    hoveredItem.roles.reduce(
                      (sum, role) => sum + role.resources[0].value,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
