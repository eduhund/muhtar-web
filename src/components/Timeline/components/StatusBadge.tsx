import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { TaskStatus } from "../types";
import { formatStatus, getStatusBadgeClass } from "../utils";

interface StatusBadgeProps {
  status: TaskStatus;
  onClick: (e: React.MouseEvent) => void;
}

export const StatusBadge = React.memo(
  ({ status, onClick }: StatusBadgeProps) => {
    return (
      <span className={getStatusBadgeClass(status)} onClick={onClick}>
        {formatStatus(status)}
        <DownOutlined className="timeline-badge-icon" />
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";
