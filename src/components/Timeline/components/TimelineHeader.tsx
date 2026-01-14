import React from "react";
import { ViewMode, TimelineWeek } from "../types";
import {
  getMonthName,
  getYear,
  getDay,
  getWeekNumber,
  isWeekend,
  isStartOfWeek,
  isStartOfMonth,
  isStartOfYear,
  isCurrentDay,
  isCurrentWeek,
  formatWeekRange,
  hasMonthChange,
  hasYearChange,
} from "../utils";

interface TimelineHeaderProps {
  viewMode: ViewMode;
  timelineDays: Date[];
  timelineWeeks: TimelineWeek[];
  unitWidth: number;
  timelineWidth: number;
  currentDate: Date;
}

export const TimelineHeader = React.memo(
  ({
    viewMode,
    timelineDays,
    timelineWeeks,
    unitWidth,
    timelineWidth,
    currentDate,
  }: TimelineHeaderProps) => {
    return (
      <div className="timeline-header">
        <div className="timeline-header-left">
          <span>Task Information</span>
        </div>

        {viewMode === "day" ? (
          <div
            className="timeline-header-timeline"
            style={{ width: timelineWidth }}
          >
            {timelineDays.map((day, index) => {
              const weekend = isWeekend(day);
              const startOfWeek = isStartOfWeek(day);
              const startOfMonth = isStartOfMonth(day);
              const startOfYear = isStartOfYear(day);
              const currentDay = isCurrentDay(day, currentDate);

              return (
                <div
                  key={index}
                  className={`timeline-header-cell ${
                    weekend ? "weekend" : ""
                  } ${currentDay ? "current" : ""}`}
                  style={{ width: unitWidth }}
                >
                  {startOfYear && (
                    <div className="timeline-header-year">
                      {getMonthName(day)} {getYear(day)}
                    </div>
                  )}
                  {startOfMonth && !startOfYear && (
                    <div className="timeline-header-month">
                      {getMonthName(day)}
                    </div>
                  )}
                  {startOfWeek && (
                    <div className="timeline-header-week">
                      Week {getWeekNumber(day)}
                    </div>
                  )}
                  <div
                    className={`timeline-header-day ${
                      weekend ? "weekend" : ""
                    } ${currentDay ? "current" : ""}`}
                  >
                    {getDay(day)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="timeline-header-timeline"
            style={{ width: timelineWidth }}
          >
            {timelineWeeks.map((week, index) => {
              const monthChange = hasMonthChange(week.start, week.end);
              const yearChange = hasYearChange(week.start, week.end);
              const currentWeek = isCurrentWeek(
                week.start,
                week.end,
                currentDate
              );
              const weekStartIsYearStart = isStartOfYear(week.start);
              const weekStartIsMonthStart = isStartOfMonth(week.start);

              return (
                <div
                  key={index}
                  className={`timeline-header-cell ${
                    currentWeek ? "current" : ""
                  }`}
                  style={{ width: unitWidth }}
                >
                  {(weekStartIsYearStart || yearChange) && (
                    <div className="timeline-header-year">
                      {getMonthName(yearChange ? week.end : week.start)}{" "}
                      {getYear(yearChange ? week.end : week.start)}
                    </div>
                  )}
                  {!weekStartIsYearStart &&
                    !yearChange &&
                    (weekStartIsMonthStart || monthChange) && (
                      <div className="timeline-header-month">
                        {getMonthName(monthChange ? week.end : week.start)}
                      </div>
                    )}
                  <div className="timeline-header-week">
                    Week {week.weekNumber}
                  </div>
                  <div
                    className={`timeline-header-week-range ${
                      currentWeek ? "current" : ""
                    }`}
                  >
                    {formatWeekRange(week.start, week.end)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

TimelineHeader.displayName = "TimelineHeader";
