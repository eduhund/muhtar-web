import React from "react";
import { CalendarOutlined, WalletOutlined } from "@ant-design/icons";
import { FlatItem } from "../types";
import { formatDuration, formatDate, calculateWorkingDays } from "../utils";

interface ResourceTooltipProps {
  item: FlatItem;
  position: { x: number; y: number };
  currentDate?: Date;
}

export const ResourceTooltip = React.memo(
  ({ item, position, currentDate = new Date() }: ResourceTooltipProps) => {
    const hasActualData =
      item.actualStartDate || item.actualDueDate || item.actualResources;

    // For in-progress tasks without actualDueDate, use currentDate as effective end date
    const effectiveActualDueDate =
      item.actualDueDate ||
      (item.status === "inProgress" && item.actualStartDate
        ? currentDate
        : null);

    // Calculate schedule status and color
    let scheduleStatus: "on-time" | "delayed" | "ahead" = "on-time";
    let scheduleColor: "red" | "yellow" | "green" | "gray" | null = null;

    if (hasActualData && item.actualStartDate && effectiveActualDueDate) {
      const actualDays = calculateWorkingDays(
        item.actualStartDate,
        effectiveActualDueDate
      );
      const plannedDays = calculateWorkingDays(item.startDate, item.dueDate);
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

    // Calculate resource status and color
    let resourceStatus: "on-budget" | "over-budget" | "under-budget" =
      "on-budget";
    let resourceColor: "red" | "yellow" | "green" | "gray" | null = null;

    if (hasActualData && item.actualResources) {
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

    // Helper function to get color class for a percentage
    const getColorClass = (
      actual: number,
      planned: number,
      isInProgress: boolean
    ): string => {
      const percent = (actual / planned) * 100;
      if (percent > 100) return "timeline-tooltip-red";
      if (percent >= 50)
        return isInProgress
          ? "timeline-tooltip-gray"
          : "timeline-tooltip-green";
      return isInProgress ? "timeline-tooltip-gray" : "timeline-tooltip-yellow";
    };

    return (
      <div
        className="timeline-tooltip"
        style={{
          left: position.x + 15,
          top: position.y + 15,
        }}
      >
        <div className="timeline-tooltip-title">{item.name}</div>

        {/* Dates section */}
        <div
          className="timeline-tooltip-section"
          style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}
        >
          <div
            className="timeline-tooltip-section-title"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <CalendarOutlined
              className={
                scheduleColor ? `timeline-tooltip-${scheduleColor}` : ""
              }
              style={{ flexShrink: 0, fontSize: 18 }}
            />
            Schedule:
          </div>
          <div className="timeline-tooltip-resources">
            {hasActualData &&
              (item.actualStartDate || effectiveActualDueDate) && (
                <div className="timeline-tooltip-resource">
                  <span className="timeline-tooltip-resource-type">
                    Actual:
                  </span>
                  <span
                    className={`timeline-tooltip-resource-value ${
                      scheduleColor ? `timeline-tooltip-${scheduleColor}` : ""
                    }`}
                  >
                    {item.actualStartDate
                      ? formatDate(item.actualStartDate)
                      : "—"}{" "}
                    -{" "}
                    {item.actualDueDate
                      ? formatDate(item.actualDueDate)
                      : "in progress"}
                  </span>
                </div>
              )}
            <div className="timeline-tooltip-resource">
              <span className="timeline-tooltip-resource-type">Planned:</span>
              <span className="timeline-tooltip-resource-value">
                {formatDate(item.startDate)} - {formatDate(item.dueDate)}
              </span>
            </div>
            {hasActualData &&
              item.actualStartDate &&
              effectiveActualDueDate && (
                <div className="timeline-tooltip-resource">
                  <span className="timeline-tooltip-resource-type">
                    Duration:
                  </span>
                  <span className="timeline-tooltip-resource-value">
                    <span
                      className={
                        scheduleColor ? `timeline-tooltip-${scheduleColor}` : ""
                      }
                    >
                      {calculateWorkingDays(
                        item.actualStartDate,
                        effectiveActualDueDate
                      )}
                      d actual
                    </span>
                    {" / "}
                    {calculateWorkingDays(item.startDate, item.dueDate)}d
                    planned
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Resources section */}
        {item.roles.length > 0 && (
          <div className="timeline-tooltip-section">
            <div className="timeline-tooltip-subtitle">
              Resources breakdown by role:
            </div>
            <div style={{ marginTop: "8px" }}>
              {item.roles.map((role, idx) => {
                const actualRole = item.actualRoles?.find(
                  (ar) => ar.key === role.key
                );
                return (
                  <div key={idx} style={{ marginTop: idx > 0 ? "8px" : "0" }}>
                    <div className="timeline-tooltip-role">{role.key}:</div>
                    <div className="timeline-tooltip-resources">
                      {role.resources.map((resource, ridx) => {
                        const actualResource = actualRole?.resources.find(
                          (ar) => ar.type === resource.type
                        );
                        const plannedValue =
                          resource.type === "time"
                            ? formatDuration(resource.value)
                            : resource.value;
                        const actualValue = actualResource
                          ? actualResource.type === "time"
                            ? formatDuration(actualResource.value)
                            : actualResource.value
                          : null;

                        const colorClass = actualResource
                          ? getColorClass(
                              actualResource.value,
                              resource.value,
                              item.status === "inProgress"
                            )
                          : "";

                        return (
                          <div key={ridx} className="timeline-tooltip-resource">
                            <span className="timeline-tooltip-resource-type">
                              {resource.type}:
                            </span>
                            <span className="timeline-tooltip-resource-value">
                              {actualValue && (
                                <span className={colorClass}>
                                  {actualValue}
                                </span>
                              )}
                              {actualValue && " / "}
                              {plannedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total resources */}
        <div className="timeline-tooltip-section">
          <div
            className="timeline-tooltip-section-title"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <WalletOutlined
              className={
                resourceColor ? `timeline-tooltip-${resourceColor}` : ""
              }
              style={{ flexShrink: 0, fontSize: 18 }}
            />
            Total resources:
          </div>
          <div className="timeline-tooltip-resources">
            {Array.from(item.resources.entries()).map(([type, value]) => {
              const actualValue = item.actualResources?.get(type);
              const plannedDisplay =
                type === "time" ? formatDuration(value) : value;
              const actualDisplay = actualValue
                ? type === "time"
                  ? formatDuration(actualValue)
                  : actualValue
                : null;

              const colorClass = actualValue
                ? getColorClass(
                    actualValue,
                    value,
                    item.status === "inProgress"
                  )
                : "";

              return (
                <div key={type} className="timeline-tooltip-resource">
                  <span className="timeline-tooltip-resource-type">
                    {type}:
                  </span>
                  <span className="timeline-tooltip-resource-value">
                    {actualDisplay && (
                      <span className={colorClass}>{actualDisplay}</span>
                    )}
                    {actualDisplay && " / "}
                    {plannedDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

ResourceTooltip.displayName = "ResourceTooltip";
