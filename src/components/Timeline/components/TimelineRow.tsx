import React, { useCallback } from "react";
import { FlatItem, BarDimensions, ViewMode } from "../types";
import { RowHeader } from "./RowHeader";
import { GanttBar } from "./GanttBar";

interface TimelineRowProps {
  item: FlatItem;
  dimensions: BarDimensions;
  isCollapsed: boolean;
  isHovered: boolean;
  isMenuOpen: boolean;
  timelineWidth: number;
  timelineStart: Date;
  dayWidth: number;
  currentDate?: Date;
  viewMode: ViewMode;
  onToggleCollapse: (id: string) => void;
  onStatusMenuOpen: (id: string, e: React.MouseEvent) => void;
  onMouseEnter: (id: string, e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export const TimelineRow = React.memo(
  ({
    item,
    dimensions,
    isCollapsed,
    isHovered,
    isMenuOpen,
    timelineWidth,
    timelineStart,
    dayWidth,
    currentDate,
    viewMode,
    onToggleCollapse,
    onStatusMenuOpen,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  }: TimelineRowProps) => {
    const handleToggleCollapse = useCallback(() => {
      onToggleCollapse(item.id);
    }, [item.id, onToggleCollapse]);

    const handleStatusMenuOpen = useCallback(
      (e: React.MouseEvent) => {
        onStatusMenuOpen(item.id, e);
      },
      [item.id, onStatusMenuOpen]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent) => {
        onMouseEnter(item.id, e);
      },
      [item.id, onMouseEnter]
    );

    const isVisualLeaf = !item.hasChildren || isCollapsed;

    return (
      <div className="timeline-row" style={{ height: dimensions.rowHeight }}>
        <RowHeader
          item={item}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onStatusMenuOpen={handleStatusMenuOpen}
        />

        <div className="timeline-row-chart" style={{ minWidth: timelineWidth }}>
          <div className="timeline-row-chart-content">
            <GanttBar
              item={item}
              dimensions={dimensions}
              isVisualLeaf={isVisualLeaf}
              isHovered={isHovered}
              isMenuOpen={isMenuOpen}
              onMouseEnter={handleMouseEnter}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              onStatusMenuOpen={handleStatusMenuOpen}
              timelineStart={timelineStart}
              dayWidth={dayWidth}
              currentDate={currentDate}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    );
  }
);

TimelineRow.displayName = "TimelineRow";
