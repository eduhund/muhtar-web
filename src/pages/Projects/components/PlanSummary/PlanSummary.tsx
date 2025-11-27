import React from "react";
import { Badge, Progress, Typography } from "antd";
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

const { Text, Title } = Typography;

// ============================================================================
// UTILITIES
// ============================================================================

function getBadgeStatus(
  status: ProjectPlanJob["status"]
): "success" | "processing" | "default" | "error" | "warning" {
  switch (status) {
    case "completed":
      return "success";
    case "inProgress":
      return "processing";
    case "canceled":
      return "error";
    case "backlog":
      return "default";
  }
}

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
  const planDuration = dayjs(stage.planEnd).diff(dayjs(stage.planStart), "day");
  const actualDuration = dayjs(stage.actualEnd || new Date()).diff(
    dayjs(stage.actualStart),
    "day"
  );
  const daysDiff = planDuration - actualDuration;
  const hasActualDates = stage.actualStart;

  return (
    <div className="ppw-dates-container">
      <span className="ppw-date-text">
        {formatDate(stage.planStart, locale)} —{" "}
        {formatDate(stage.planEnd, locale)}
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
  const progressPercentage = Math.min((totalSpent / totalBudget) * 100, 100);
  const hasOverspend = totalSpent > 0; //totalBudget;
  const overspendAmount = totalSpent - 0; //totalBudget;
  return (
    <div className="ppw-progress-section">
      <div className="ppw-budget-header">
        <Text>Budget</Text>
        {hasOverspend && (
          <Text type="danger">
            Overspending: {formatMoney(overspendAmount, currency, locale)}
          </Text>
        )}
        <div className="ppw-budget-amounts">
          <Text>{formatMoney(totalSpent, currency, locale)}</Text>
          <Text type="secondary">/</Text>
          <Text type="secondary">
            {formatMoney(totalBudget, currency, locale)}
          </Text>
        </div>
      </div>
      <Progress
        percent={progressPercentage}
        showInfo={false}
        status={hasOverspend ? "exception" : "normal"}
      />
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

  let unknownRoleDuration = 0;

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

    if (!role) {
      unknownRoleDuration += entry.duration;
      return;
    }

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
        <Badge status={getBadgeStatus(stage.status)} />
        <Title level={5}>{stage.name}</Title>
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

      {unknownRoleDuration > 0 && (
        <div className="ppw-stage-warning">
          Resources without project role: {unknownRoleDuration / 60}h
        </div>
      )}
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
