import React from "react";
import { Typography } from "antd";
import "./PlanSummary.scss";

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectStage {
  id: string;
  name: string;
  plannedStart: string; // ISO date format (YYYY-MM-DD)
  plannedEnd: string; // ISO date format (YYYY-MM-DD)
  actualStart?: string; // ISO date format (YYYY-MM-DD)
  actualEnd?: string; // ISO date format (YYYY-MM-DD)
  budget: number; // Amount in currency
  spent: number; // Amount in currency
  status: "completed" | "inProgress" | "canceled" | "backlog";
  plannedDays: number;
  actualDays: number;
}

export interface ProjectPlanWidgetProps {
  stages: ProjectStage[];
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

const getStatusConfig = (status: ProjectStage["status"]): StatusConfig => {
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

const getProgressClassName = (
  spent: number,
  budget: number,
  status: ProjectStage["status"]
): string => {
  if (spent > budget) return "ppw-progress-fill--overspend";
  if (status === "completed") return "ppw-progress-fill--completed";
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

const formatDate = (dateStr: string | undefined, locale: string): string => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
};

// ============================================================================
// INTERNAL COMPONENTS
// ============================================================================

interface StatusBadgeProps {
  status: ProjectStage["status"];
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
      {daysDiff}д
    </span>
  );
};

interface DatesDisplayProps {
  stage: ProjectStage;
  locale: string;
}

const DatesDisplay: React.FC<DatesDisplayProps> = ({ stage, locale }) => {
  const daysDiff = stage.actualDays - stage.plannedDays;
  const hasActualDates = stage.actualStart && stage.actualStart.length > 0;

  return (
    <div className="ppw-dates-container">
      <span className="ppw-date-text">
        {formatDate(stage.plannedStart, locale)} —{" "}
        {formatDate(stage.plannedEnd, locale)}
      </span>
      <span className="ppw-date-text ppw-date-text--muted">
        ({stage.plannedDays}д)
      </span>

      {hasActualDates && (
        <>
          <span className="ppw-date-arrow">→</span>
          <span className="ppw-date-text ppw-date-text--actual">
            {formatDate(stage.actualStart, locale)} —{" "}
            {stage.actualEnd ? formatDate(stage.actualEnd, locale) : "..."}
          </span>
          {stage.actualDays > 0 && (
            <span className="ppw-date-text ppw-date-text--muted">
              ({stage.actualDays}д)
            </span>
          )}
          <DaysDiffBadge daysDiff={daysDiff} />
        </>
      )}
    </div>
  );
};

interface ProgressBarProps {
  stage: ProjectStage;
  currency: string;
  locale: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  stage,
  currency,
  locale,
}) => {
  const progressClass = getProgressClassName(
    stage.spent,
    stage.budget,
    stage.status
  );
  const progressPercentage = Math.min((stage.spent / stage.budget) * 100, 100);
  const hasOverspend = stage.spent > stage.budget;
  const overspendAmount = stage.spent - stage.budget;

  return (
    <div className="ppw-progress-section">
      <div className="ppw-budget-header">
        <span className="ppw-budget-label">Бюджет</span>
        <div className="ppw-budget-amounts">
          <span className="ppw-budget-spent">
            {formatMoney(stage.spent, currency, locale)}
          </span>
          <span className="ppw-budget-separator">/</span>
          <span className="ppw-budget-total">
            {formatMoney(stage.budget, currency, locale)}
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
  stage: ProjectStage;
  currency: string;
  locale: string;
}

const StageCard: React.FC<StageCardProps> = ({ stage, currency, locale }) => {
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
      <ProgressBar stage={stage} currency={currency} locale={locale} />
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PlanSummary: React.FC<ProjectPlanWidgetProps> = ({
  stages,
  currency = "RUB",
  locale = "ru-RU",
  className = "",
}) => {
  return (
    <div className={`ppw-widget ${className}`}>
      <Title level={4}>Main Stages</Title>
      <div className="ppw-stages-container">
        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            currency={currency}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
};
