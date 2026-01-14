import React from "react";
import {
  CalendarOutlined,
  MoreOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { FlatItem, BarDimensions, ViewMode } from "../types";
import {
  getStatusStyles,
  formatDate,
  calculateWorkingDays,
  formatDuration,
} from "../utils";

interface GanttBarProps {
  item: FlatItem;
  dimensions: BarDimensions;
  isVisualLeaf: boolean;
  isHovered: boolean;
  isMenuOpen: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onStatusMenuOpen: (e: React.MouseEvent) => void;
  timelineStart: Date;
  dayWidth: number;
  currentDate?: Date;
  viewMode: ViewMode;
}

export const GanttBar = React.memo(
  ({
    item,
    dimensions,
    isVisualLeaf,
    isHovered,
    isMenuOpen,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onStatusMenuOpen,
    timelineStart,
    dayWidth,
    currentDate = new Date(),
    viewMode,
  }: GanttBarProps) => {
    const statusStyles = getStatusStyles(item.status, isVisualLeaf);
    const planStart = new Date(item.planStart);
    const planEnd = new Date(item.planEnd);
    const days = calculateWorkingDays(planStart, planEnd);

    const minWidthForText = 120;
    const minHeightForText = 35;
    const textFitsInside =
      dimensions.width >= minWidthForText &&
      dimensions.barHeight >= minHeightForText;

    // Calculate actual bar dimensions if actual data exists
    let actualBarDimensions: {
      left: number;
      width: number;
      height?: number;
    } | null = null;
    let hasActualData = false;
    //let isDelayed = false;
    //let isAheadOfSchedule = false;

    // Calculate schedule and resource status
    let scheduleStatus: "on-time" | "delayed" | "ahead" | null = null;
    let resourceStatus: "on-budget" | "over-budget" | "under-budget" | null =
      null;

    let scheduleColor: "red" | "yellow" | "green" | "gray" | null = null;
    let resourceColor: "red" | "yellow" | "green" | "gray" | null = null;

    const effectiveActualDueDate =
      item.actualDueDate ||
      (item.status === "inProgress" && item.actualStartDate
        ? currentDate
        : null);

    if (item.actualStartDate && effectiveActualDueDate) {
      hasActualData = true;

      // Calculate schedule status
      const actualDays = calculateWorkingDays(
        item.actualStartDate,
        effectiveActualDueDate
      );
      const plannedDays = calculateWorkingDays(planStart, planEnd);
      const timePercent = (actualDays / plannedDays) * 100;

      if (timePercent > 100) {
        scheduleStatus = "delayed";
        scheduleColor = "red";
      } else if (timePercent >= 50) {
        scheduleStatus = "on-time";
        scheduleColor = item.status === "inProgress" ? "gray" : "green";
      } else {
        scheduleStatus = "ahead";
        scheduleColor = item.status === "inProgress" ? "gray" : "yellow";
      }
    }

    // Calculate resource status
    if (item.actualResources) {
      const timeResource = item.resources.get("time") || 0;
      const actualTimeResource = item.actualResources.get("time") || 0;
      const resourcePercent = (actualTimeResource / timeResource) * 100;

      if (resourcePercent > 100) {
        resourceStatus = "over-budget";
        resourceColor = "red";
      } else if (resourcePercent >= 50) {
        resourceStatus = "on-budget";
        resourceColor = item.status === "inProgress" ? "gray" : "green";
      } else {
        resourceStatus = "under-budget";
        resourceColor = item.status === "inProgress" ? "gray" : "yellow";
      }
    }

    // Calculate actual bar dimensions for visual representation
    if (item.actualStartDate && item.actualDueDate) {
      const actualStart = item.actualStartDate;
      const actualDue = item.actualDueDate;

      let left: number, width: number;

      if (viewMode === "week") {
        const daysSinceStart =
          (actualStart.getTime() - timelineStart.getTime()) /
          (1000 * 60 * 60 * 24);
        const weeksSinceStart = daysSinceStart / 7;

        const durationDays =
          (actualDue.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24);
        const durationWeeks = durationDays / 7;

        left = weeksSinceStart * dayWidth;
        width = Math.max(durationWeeks * dayWidth, dayWidth * 0.2);
      } else {
        const daysFromStart = Math.floor(
          (actualStart.getTime() - timelineStart.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const actualDuration = Math.floor(
          (actualDue.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        left = daysFromStart * dayWidth;
        width = Math.max(actualDuration * dayWidth, 2);
      }

      actualBarDimensions = {
        left,
        width,
        height: dimensions.actualBarHeight || dimensions.barHeight,
      };

      // Check if delayed or ahead of schedule
      if (item.status === "completed") {
        //isDelayed = actualDue.getTime() > planEnd.getTime();
        //isAheadOfSchedule = actualDue.getTime() < planEnd.getTime();
      }
    } else if (item.actualStartDate && item.status === "inProgress") {
      // Show partial progress for in-progress tasks
      const actualStart = item.actualStartDate;
      const now = currentDate;

      let left: number, width: number;

      if (viewMode === "week") {
        const daysSinceStart =
          (actualStart.getTime() - timelineStart.getTime()) /
          (1000 * 60 * 60 * 24);
        const weeksSinceStart = daysSinceStart / 7;

        const durationDays =
          (now.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24);
        const durationWeeks = durationDays / 7;

        left = weeksSinceStart * dayWidth;
        width = Math.max(durationWeeks * dayWidth, dayWidth * 0.2);
      } else {
        const daysFromStart = Math.floor(
          (actualStart.getTime() - timelineStart.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        const actualDuration = Math.floor(
          (now.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        left = daysFromStart * dayWidth;
        width = Math.max(actualDuration * dayWidth, 2);
      }

      actualBarDimensions = {
        left,
        width,
        height: dimensions.actualBarHeight || dimensions.barHeight,
      };

      // Check if currently delayed (past due date)
      //isDelayed = now.getTime() > planEnd.getTime();
    }

    return (
      <>
        {/* Planned bar */}
        <div
          className={statusStyles.className}
          style={{
            left: dimensions.left,
            width: dimensions.width,
            height: dimensions.barHeight,
          }}
          onMouseEnter={onMouseEnter}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {/* Status stripe */}
          <div className={`timeline-stripe ${statusStyles.stripeColor}`} />

          {/* Status menu button */}
          {(isHovered || isMenuOpen) && (
            <button
              className="timeline-status-button"
              onClick={onStatusMenuOpen}
              aria-label="Change status"
            >
              <MoreOutlined className="timeline-status-button-icon" />
            </button>
          )}

          {/* Status indicators in top right corner */}
          {(scheduleColor || resourceColor) && (
            <div className="timeline-status-indicators">
              {scheduleColor && (
                <div
                  className="timeline-status-indicator"
                  title={`Schedule: ${
                    scheduleStatus === "delayed"
                      ? "Delayed"
                      : scheduleStatus === "ahead"
                      ? "Ahead"
                      : "On time"
                  }`}
                >
                  <CalendarOutlined
                    style={{ fontSize: 14 }}
                    className={`timeline-status-icon timeline-status-${scheduleColor}`}
                  />
                </div>
              )}
              {resourceColor && (
                <div
                  className="timeline-status-indicator"
                  title={`Resources: ${
                    resourceStatus === "over-budget"
                      ? "Over budget"
                      : resourceStatus === "under-budget"
                      ? "Under budget"
                      : "On budget"
                  }`}
                >
                  <WalletOutlined
                    style={{ fontSize: 14 }}
                    className={`timeline-status-icon timeline-status-${resourceColor}`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Text inside bar */}
          {textFitsInside && (
            <div className="timeline-bar-text-inside">
              <div
                className={`timeline-bar-name ${
                  item.hasSubJobs ? "has-children" : ""
                }`}
              >
                {item.name}
              </div>
              <div className="timeline-bar-details">
                {formatDate(planStart)} - {formatDate(planEnd)} • {days}d •{" "}
                {formatDuration(item.resources.get("time") || 0)}
              </div>
            </div>
          )}
        </div>

        {/* Actual progress bar (sibling, not inside planned bar) */}
        {hasActualData && actualBarDimensions && (
          <div
            className={`timeline-actual-bar ${
              !isVisualLeaf
                ? "timeline-actual-bar-parent"
                : `timeline-actual-bar-${item.status}`
            }`}
            style={{
              left: actualBarDimensions.left,
              width: actualBarDimensions.width,
              height: actualBarDimensions.height,
            }}
          />
        )}

        {/* Text outside bar */}
        {!textFitsInside && (
          <div
            className="timeline-bar-text-outside"
            style={{ left: dimensions.left + dimensions.width + 4 }}
          >
            <div
              className={`timeline-bar-name ${
                item.hasSubJobs ? "has-children" : ""
              }`}
            >
              {item.name}
            </div>
            <div className="timeline-bar-details">
              {formatDate(planStart)} - {formatDate(planEnd)} • {days}d •{" "}
              {formatDuration(item.resources.get("time") || 0)}
            </div>
          </div>
        )}
      </>
    );
  }
);

GanttBar.displayName = "GanttBar";
