import React from "react";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { FlatItem } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDate, calculateWorkingDays, formatDuration } from "../utils";

interface RowHeaderProps {
  item: FlatItem;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onStatusMenuOpen: (e: React.MouseEvent) => void;
}

export const RowHeader = React.memo(
  ({
    item,
    isCollapsed,
    onToggleCollapse,
    onStatusMenuOpen,
  }: RowHeaderProps) => {
    const planStart = new Date(item.planStart);
    const planEnd = new Date(item.planEnd);
    const days = calculateWorkingDays(planStart, planEnd);

    return (
      <div
        className="timeline-row-header"
        style={{ paddingLeft: `${8 + item.level * 16}px` }}
      >
        <div className="timeline-row-header-content">
          {item.hasChildren ? (
            <button onClick={onToggleCollapse} className="timeline-row-toggle">
              {isCollapsed ? (
                <RightOutlined className="w-3 h-3" />
              ) : (
                <DownOutlined className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="timeline-row-spacer" />
          )}
          <div
            className={`timeline-row-name ${
              item.hasChildren ? "has-children" : ""
            }`}
          >
            {item.name}
          </div>
          <StatusBadge status={item.status} onClick={onStatusMenuOpen} />
        </div>
        <div className="timeline-row-info">
          {formatDate(planStart)} - {formatDate(planEnd)} • {days}d •{" "}
          {formatDuration(item.resources.get("time") || 0)}
        </div>
      </div>
    );
  }
);

RowHeader.displayName = "RowHeader";
