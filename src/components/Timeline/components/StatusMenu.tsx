import React from "react";
import { TaskStatus } from "../types";
import { formatStatus, getStatusBadgeClass } from "../utils";

interface StatusMenuProps {
  position: { x: number; y: number };
  currentStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  onClose: () => void;
}

const STATUSES: TaskStatus[] = [
  "backlog",
  "inProgress",
  "completed",
  "canceled",
];

export const StatusMenu = React.memo(
  ({ position, currentStatus, onStatusChange, onClose }: StatusMenuProps) => {
    const handleStatusClick = (status: TaskStatus) => {
      onStatusChange(status);
      onClose();
    };

    return (
      <div
        className="timeline-status-menu"
        style={{
          left: position.x,
          top: position.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="timeline-status-menu-header">Change Status</div>
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`timeline-status-menu-item ${
              currentStatus === status ? "active" : ""
            }`}
            onClick={() => handleStatusClick(status)}
          >
            <span className={getStatusBadgeClass(status)}>
              {formatStatus(status)}
            </span>
          </button>
        ))}
      </div>
    );
  }
);

StatusMenu.displayName = "StatusMenu";
