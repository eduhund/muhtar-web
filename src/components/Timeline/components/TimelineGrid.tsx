import React from "react";
import { ViewMode, TimelineWeek } from "../types";
import { isWeekend } from "../utils";

interface TimelineGridProps {
  viewMode: ViewMode;
  timelineDays: Date[];
  timelineWeeks: TimelineWeek[];
  unitWidth: number;
  currentDayPosition: number | null;
}

export const TimelineGrid = React.memo(
  ({
    viewMode,
    timelineDays,
    timelineWeeks,
    unitWidth,
    currentDayPosition,
  }: TimelineGridProps) => {
    const timelineUnits = viewMode === "week" ? timelineWeeks : timelineDays;

    return (
      <div className="timeline-grid">
        {/* Grid lines */}
        {timelineUnits.map((_, index) => (
          <div
            key={`grid-${index}`}
            className="timeline-grid-line"
            style={{ left: index * unitWidth }}
          />
        ))}

        {/* Weekend overlays */}
        {timelineUnits.map((unit, index) => {
          const day =
            viewMode === "week" ? (unit as TimelineWeek).start : (unit as Date);
          if (!isWeekend(day)) return null;
          return (
            <div
              key={`weekend-${index}`}
              className="timeline-weekend-overlay"
              style={{ left: index * unitWidth, width: unitWidth }}
            />
          );
        })}

        {/* Current day indicator */}
        {currentDayPosition !== null && (
          <div
            className="timeline-current-indicator"
            style={{ left: currentDayPosition }}
          />
        )}
      </div>
    );
  }
);

TimelineGrid.displayName = "TimelineGrid";
