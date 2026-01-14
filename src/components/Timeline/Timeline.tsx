import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  GanttItem,
  ViewMode,
  TimelineWeek,
  BarDimensions,
  TaskStatus,
} from "./types";
import { flattenData, getRowHeight, getWeekNumber, isWeekend } from "./utils";
import { TimelineHeader } from "./components/TimelineHeader";
import { TimelineGrid } from "./components/TimelineGrid";
import { TimelineRow } from "./components/TimelineRow";
import { StatusMenu } from "./components/StatusMenu";
import { ResourceTooltip } from "./components/ResourceTooltip";

import "./Timeline.scss";

interface TimelineProps {
  data: GanttItem[];
  viewMode?: ViewMode;
  onDataChange?: (data: GanttItem[]) => void;
}

const DAY_WIDTH = 40;

export function Timeline({
  data,
  viewMode = "day",
  onDataChange,
}: TimelineProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [statusMenuItemId, setStatusMenuItemId] = useState<string | null>(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const currentDate = useMemo(() => new Date(), []);
  const dayWidth = DAY_WIDTH;

  const unitWidth = viewMode === "week" ? 100 : dayWidth;

  // Flatten data
  const flatData = useMemo(
    () => flattenData(data, collapsedItems),
    [data, collapsedItems]
  );

  // Calculate timeline range
  const { minDate, maxDate } = useMemo(() => {
    if (flatData.length === 0) {
      return { minDate: new Date(), maxDate: new Date() };
    }
    const minDate = new Date(
      Math.min(...flatData.map((item) => item.startDate.getTime()))
    );
    const maxDate = new Date(
      Math.max(...flatData.map((item) => item.dueDate.getTime()))
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

  // Generate timeline weeks
  const timelineWeeks = useMemo(() => {
    const weeks: TimelineWeek[] = [];
    const currentDate = new Date(minDate);

    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentDate.setDate(currentDate.getDate() + daysToMonday);

    while (currentDate <= maxDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        start: weekStart,
        end: weekEnd,
        weekNumber: getWeekNumber(weekStart),
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  }, [minDate, maxDate]);

  const timelineWidth =
    viewMode === "week"
      ? timelineWeeks.length * unitWidth
      : timelineDays.length * unitWidth;

  // Calculate max duration for row height scaling
  const maxDuration = useMemo(() => {
    return Math.max(...flatData.map((item) => item.resources.get("time") || 0));
  }, [flatData]);

  // Calculate bar dimensions
  const getBarDimensions = useCallback(
    (item: (typeof flatData)[0]): BarDimensions => {
      let left: number, width: number;

      if (viewMode === "week") {
        const weekStart = timelineWeeks[0]?.start || minDate;
        const daysSinceStart =
          (item.startDate.getTime() - weekStart.getTime()) /
          (1000 * 60 * 60 * 24);
        const weeksSinceStart = daysSinceStart / 7;

        const durationDays =
          (item.dueDate.getTime() - item.startDate.getTime()) /
          (1000 * 60 * 60 * 24);
        const durationWeeks = durationDays / 7;

        left = weeksSinceStart * unitWidth;
        width = Math.max(durationWeeks * unitWidth, unitWidth * 0.2);
      } else {
        const daysSinceStart = Math.floor(
          (item.startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const durationDays =
          Math.ceil(
            (item.dueDate.getTime() - item.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ) || 1;

        left = daysSinceStart * unitWidth;
        width = durationDays * unitWidth;
      }

      const isCollapsed = collapsedItems.has(item.id);
      const heightResult = getRowHeight(
        item.resources,
        item.hasChildren,
        isCollapsed,
        maxDuration,
        item.actualResources
      );

      return {
        left,
        width,
        barHeight: heightResult.barHeight,
        rowHeight: heightResult.rowHeight,
        actualBarHeight: heightResult.actualBarHeight,
      };
    },
    [viewMode, timelineWeeks, minDate, unitWidth, collapsedItems, maxDuration]
  );

  // Current day indicator position
  const getCurrentDayPosition = useCallback((): number | null => {
    if (currentDate < minDate || currentDate > maxDate) {
      return null;
    }

    if (viewMode === "week") {
      const weekStart = timelineWeeks[0]?.start || minDate;
      const daysSinceStart =
        (currentDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24);
      const weeksSinceStart = daysSinceStart / 7;
      return weeksSinceStart * unitWidth;
    } else {
      const daysSinceStart =
        (currentDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceStart * unitWidth;
    }
  }, [currentDate, minDate, maxDate, viewMode, timelineWeeks, unitWidth]);

  const currentDayPosition = getCurrentDayPosition();

  // Handlers
  const handleToggleCollapse = useCallback((itemId: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleMouseEnter = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      setHoveredItemId(itemId);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredItemId(null);
  }, []);

  const handleStatusMenuOpen = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (statusMenuItemId === itemId) {
        setStatusMenuItemId(null);
        return;
      }

      setStatusMenuItemId(itemId);
      setStatusMenuPosition({ x: e.clientX, y: e.clientY });
    },
    [statusMenuItemId]
  );

  const handleStatusChange = useCallback(
    (itemId: string, newStatus: TaskStatus) => {
      if (!onDataChange) return;

      const updateItem = (item: GanttItem, parentId?: string): GanttItem => {
        if (item.id === itemId) {
          const updatedItem = { ...item, status: newStatus };

          // Handle children updates based on new status
          if (item.children && item.children.length > 0) {
            if (newStatus === "inProgress") {
              // 1.2 For inProgress: keep completed, set first backlog to inProgress
              const completedCount = item.children.filter(
                (c) => c.status === "completed"
              ).length;

              if (completedCount === item.children.length) {
                // 1.2.4 All children completed - set last child to inProgress
                updatedItem.children = item.children.map((child, index) => {
                  if (index === item.children!.length - 1) {
                    return { ...child, status: "inProgress" };
                  }
                  return child;
                });
              } else {
                // 1.2.2 Set first backlog child to inProgress
                let firstBacklogSet = false;
                updatedItem.children = item.children.map((child) => {
                  if (!firstBacklogSet && child.status === "backlog") {
                    firstBacklogSet = true;
                    return { ...child, status: "inProgress" };
                  }
                  // 1.2.1 Keep completed as is, 1.2.3 Keep others as is
                  return child;
                });
              }
            } else if (newStatus === "completed") {
              // 2.2 Set all children to completed, except canceled
              const setChildrenCompleted = (child: GanttItem): GanttItem => ({
                ...child,
                status: child.status === "canceled" ? "canceled" : "completed",
                children: child.children?.map(setChildrenCompleted),
              });
              updatedItem.children = item.children.map(setChildrenCompleted);
            } else if (newStatus === "canceled") {
              // 3.2 Set all children to canceled
              const setChildrenCanceled = (child: GanttItem): GanttItem => ({
                ...child,
                status: "canceled",
                children: child.children?.map(setChildrenCanceled),
              });
              updatedItem.children = item.children.map(setChildrenCanceled);
            } else if (newStatus === "backlog") {
              // 4.2 Set all children to backlog
              const setChildrenBacklog = (child: GanttItem): GanttItem => ({
                ...child,
                status: "backlog",
                children: child.children?.map(setChildrenBacklog),
              });
              updatedItem.children = item.children.map(setChildrenBacklog);
            }
          }

          return updatedItem;
        }

        if (item.children) {
          const updatedChildren = item.children.map((child) =>
            updateItem(child, item.id)
          );

          // Check if this item is parent of the changed item
          const hasChangedChild = updatedChildren.some((c) => c.id === itemId);

          if (hasChangedChild) {
            const childStatuses = updatedChildren.map(
              (c) => c.status || "backlog"
            );
            const allCompleted = childStatuses.every((s) => s === "completed");
            const allCanceled = childStatuses.every((s) => s === "canceled");
            const allBacklog = childStatuses.every((s) => s === "backlog");

            let newParentStatus = item.status || "backlog";

            if (newStatus === "inProgress") {
              // 1.3 Parent becomes inProgress regardless of current status
              newParentStatus = "inProgress";
            } else if (newStatus === "completed") {
              // 2.3 If all children completed - parent becomes completed, else inProgress
              if (allCompleted) {
                newParentStatus = "completed";
              } else {
                newParentStatus = "inProgress";
              }
            } else if (newStatus === "canceled") {
              // 3.3 If all canceled - parent becomes canceled, else keep current
              if (allCanceled) {
                newParentStatus = "canceled";
              }
              // else keep current status
            } else if (newStatus === "backlog") {
              // 4.3 If all backlog - parent becomes backlog
              // If was completed or canceled - parent becomes inProgress
              if (allBacklog) {
                newParentStatus = "backlog";
              } else if (
                item.status === "completed" ||
                item.status === "canceled"
              ) {
                newParentStatus = "inProgress";
              }
              // else keep current status
            }

            return {
              ...item,
              status: newParentStatus,
              children: updatedChildren,
            };
          }

          return {
            ...item,
            children: updatedChildren,
          };
        }

        return item;
      };

      const updatedData = data.map((item) => updateItem(item));
      onDataChange(updatedData);
    },
    [data, onDataChange]
  );

  // Close status menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (statusMenuItemId) {
        setStatusMenuItemId(null);
      }
    };

    if (statusMenuItemId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [statusMenuItemId]);

  const hoveredItem = hoveredItemId
    ? flatData.find((item) => item.id === hoveredItemId)
    : null;
  const menuItem = statusMenuItemId
    ? flatData.find((item) => item.id === statusMenuItemId)
    : null;

  return (
    <div className="timeline-container">
      <div className="timeline-scroll-area">
        <div
          className="timeline-content"
          style={{ minWidth: 256 + timelineWidth }}
        >
          <TimelineHeader
            viewMode={viewMode}
            timelineDays={timelineDays}
            timelineWeeks={timelineWeeks}
            unitWidth={unitWidth}
            timelineWidth={timelineWidth}
            currentDate={currentDate}
          />

          <TimelineGrid
            viewMode={viewMode}
            timelineDays={timelineDays}
            timelineWeeks={timelineWeeks}
            unitWidth={unitWidth}
            currentDayPosition={currentDayPosition}
          />

          {flatData.map((item) => {
            const dimensions = getBarDimensions(item);
            const isCollapsed = collapsedItems.has(item.id);

            return (
              <TimelineRow
                key={item.id}
                item={item}
                dimensions={dimensions}
                isCollapsed={isCollapsed}
                isHovered={hoveredItemId === item.id}
                isMenuOpen={statusMenuItemId === item.id}
                timelineWidth={timelineWidth}
                timelineStart={minDate}
                dayWidth={unitWidth}
                currentDate={currentDate}
                viewMode={viewMode}
                onToggleCollapse={handleToggleCollapse}
                onStatusMenuOpen={handleStatusMenuOpen}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItem && !statusMenuItemId && (
        <ResourceTooltip
          item={hoveredItem}
          position={tooltipPosition}
          currentDate={currentDate}
        />
      )}

      {/* Status Menu */}
      {menuItem && onDataChange && (
        <StatusMenu
          position={statusMenuPosition}
          currentStatus={menuItem.status}
          onStatusChange={(status) => handleStatusChange(menuItem.id, status)}
          onClose={() => setStatusMenuItemId(null)}
        />
      )}
    </div>
  );
}
