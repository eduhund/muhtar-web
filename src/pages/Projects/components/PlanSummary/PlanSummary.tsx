import React from "react";
import { Typography } from "antd";
import "./PlanSummary.scss";
import { Project, ProjectPlanJob } from "../../../../context/AppContext";
import { useTimetable } from "../../../../hooks/useTimetable";
import dayjs from "dayjs";

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectPlanWidgetProps {
  project: Project;
  currency?: string; // Default: 'RUB'
  locale?: string; // Default: 'ru-RU'
  className?: string;
}

interface StatusConfig {
  className: string;
  text: string;
}

const { Title } = Typography;

// ============================================================================
// UTILITIES
// ============================================================================

const getStatusConfig = (status: ProjectPlanJob["status"]): StatusConfig => {
  switch (status) {
    case "completed":
      return {
        className: "ppw-status-badge--completed",
        text: "Completed",
      };
    case "inProgress":
      return {
        className: "ppw-status-badge--in-progress",
        text: "In Progress",
      };
    case "canceled":
      return {
        className: "ppw-status-badge--canceled",
        text: "Canceled",
      };
    case "backlog":
      return {
        className: "ppw-status-badge--not-started",
        text: "Backlog",
      };
  }
};

const getProgressClassName = (spent: number, budget: number): string => {
  if (spent > budget) return "ppw-progress-fill--overspend";
  const percentage = (spent / budget) * 100;
  if (percentage > 75) return "ppw-progress-fill--high";
  if (percentage > 50) return "ppw-progress-fill--medium";
  return "ppw-progress-fill--low";
};

const formatMoney = (
  amount: number,
  currency: string,
  locale: string
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string | null, locale: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
};

// ============================================================================
// INTERNAL COMPONENTS
// ============================================================================

interface StatusBadgeProps {
  status: ProjectPlanJob["status"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <span className={`ppw-status-badge ${config.className}`}>
      {config.text}
    </span>
  );
};

interface DaysDiffBadgeProps {
  daysDiff: number;
}

const DaysDiffBadge: React.FC<DaysDiffBadgeProps> = ({ daysDiff }) => {
  if (daysDiff === 0) return null;

  const badgeClass =
    daysDiff > 0
      ? "ppw-days-diff-badge--positive"
      : "ppw-days-diff-badge--negative";

  return (
    <span className={`ppw-days-diff-badge ${badgeClass}`}>
      {daysDiff > 0 ? "+" : ""}
      {daysDiff}d
    </span>
  );
};

interface DatesDisplayProps {
  stage: ProjectPlanJob;
  locale: string;
}

const DatesDisplay: React.FC<DatesDisplayProps> = ({ stage, locale }) => {
  const planDuration = dayjs(stage.estimatedEnd).diff(
    dayjs(stage.estimatedStart),
    "day"
  );
  const actualDuration = dayjs(stage.actualEnd || new Date()).diff(
    dayjs(stage.actualStart),
    "day"
  );
  const daysDiff = planDuration - actualDuration;
  const hasActualDates = stage.actualStart;

  return (
    <div className="ppw-dates-container">
      <span className="ppw-date-text">
        {formatDate(stage.estimatedStart, locale)} —{" "}
        {formatDate(stage.estimatedEnd, locale)}
      </span>
      <span className="ppw-date-text ppw-date-text--muted">
        ({planDuration}d)
      </span>

      {hasActualDates && (
        <>
          <span className="ppw-date-arrow">→</span>
          <span className="ppw-date-text ppw-date-text--actual">
            {formatDate(stage.actualStart, locale)} —{" "}
            {stage.actualEnd ? formatDate(stage.actualEnd, locale) : "..."}
          </span>
          {stage.actualEnd && (
            <span className="ppw-date-text ppw-date-text--muted">
              ({actualDuration}d)
            </span>
          )}
          <DaysDiffBadge daysDiff={daysDiff} />
        </>
      )}
    </div>
  );
};

interface ProgressBarProps {
  totalBudget: number;
  totalSpent: number;
  currency: string;
  locale: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  totalBudget,
  totalSpent,
  currency,
  locale,
}) => {
  const progressClass = getProgressClassName(totalSpent, totalBudget);
  const progressPercentage = Math.min((totalSpent / totalBudget) * 100, 100);
  const hasOverspend = totalSpent > totalBudget;
  const overspendAmount = totalSpent - totalBudget;
  return (
    <div className="ppw-progress-section">
      <div className="ppw-budget-header">
        <span className="ppw-budget-label">Budget</span>
        <div className="ppw-budget-amounts">
          <span className="ppw-budget-spent">
            {formatMoney(0, currency, locale)}
          </span>
          <span className="ppw-budget-separator">/</span>
          <span className="ppw-budget-total">
            {formatMoney(totalBudget, currency, locale)}
          </span>
        </div>
      </div>
      <div className="ppw-progress-track">
        <div
          className={`ppw-progress-fill ${progressClass}`}
          style={{ width: `${progressPercentage}%` }}
        />
        {hasOverspend && <div className="ppw-progress-overlay" />}
      </div>
      {hasOverspend && (
        <div className="ppw-overspend-container">
          <span className="ppw-overspend-text">
            Overspending: {formatMoney(overspendAmount, currency, locale)}
          </span>
        </div>
      )}
    </div>
  );
};

interface StageCardProps {
  stage: ProjectPlanJob;
  contract: Project["activeContract"];
  memberships: Project["memberships"];
  currency: string;
  locale: string;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  contract,
  memberships,
  currency,
  locale,
}) => {
  const { timetable } = useTimetable();
  const roles = contract?.roles || [];
  const filteredEntries = timetable?.filter((entry) => {
    return entry.target?.type === "job" && entry.target?.id === stage.id;
  });

  const userResourceMap: Record<string, { duration: number; cost: number }> =
    {};

  filteredEntries?.forEach((entry) => {
    const membershipId = entry.membership.id;
    const membership = memberships.find(
      (m) => m.membershipId === membershipId || m.membershipId === membershipId
    );
    const roleKey = membership?.workRole;
    const role = roles.find((r) => (r.key || r.name) === roleKey);
    const cost =
      role?.resources?.find((resource) => resource.type === "time")?.costPerUnit
        .amount || 0;
    if (!userResourceMap[membershipId]) {
      userResourceMap[membershipId] = {
        duration: 0,
        cost,
      };
    }
    userResourceMap[membershipId].duration += entry.duration;
  });

  const userResources = Object.entries(userResourceMap).map(
    ([membershipId, { duration, cost }]) => ({
      membershipId,
      duration,
      cost,
      total: (duration * cost) / 60,
    })
  );

  const totalMoney = userResources.reduce((acc, user) => acc + user.total, 0);

  return (
    <div className="ppw-stage-card">
      {/* Header */}
      <div className="ppw-stage-header">
        <span className="ppw-stage-name">{stage.name}</span>
        <StatusBadge status={stage.status} />
      </div>

      {/* Dates */}
      <DatesDisplay stage={stage} locale={locale} />

      {/* Progress */}
      <ProgressBar
        totalBudget={stage.totalBudget}
        totalSpent={totalMoney}
        currency={currency}
        locale={locale}
      />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PlanSummary: React.FC<ProjectPlanWidgetProps> = ({
  project,
  currency = "RUB",
  locale = "ru-RU",
  className = "",
}) => {
  const stages = project?.activePlan?.jobs || [];
  return (
    <div className={`ppw-widget ${className}`}>
      <Title level={4}>Main Stages</Title>
      <div className="ppw-stages-container">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            contract={project.activeContract}
            memberships={project.memberships}
            currency={currency}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
};
