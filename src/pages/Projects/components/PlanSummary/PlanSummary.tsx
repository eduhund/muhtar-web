import React from "react";
import { Button, Progress, Typography } from "antd";
import "./PlanSummary.scss";
import { Project, ProjectPlanJob } from "../../../../context/AppContext";
import { useTimetable } from "../../../../hooks/useTimetable";
import dayjs from "dayjs";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import {
  getResourceName,
  getResourceValue,
} from "../../../../utils/projectResources";

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

function getBadgeStatus(status: ProjectPlanJob["status"]): {
  text: string;
  color: string;
} {
  switch (status) {
    case "completed":
      return { text: "Completed", color: "green" };
    case "inProgress":
      return { text: "In Progress", color: "blue" };
    case "canceled":
      return { text: "Canceled", color: "red" };
    case "backlog":
      return { text: "Backlog", color: "rgba(200, 200, 200, 1)" };
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

interface DatesDisplayProps {
  stage: ProjectPlanJob;
}

const DatesDisplay: React.FC<DatesDisplayProps> = ({ stage }) => {
  const locale = "ru-RU";
  const planDuration = dayjs(stage.planEnd).diff(dayjs(stage.planStart), "day");
  const actualDuration = dayjs(stage.actualEnd || new Date()).diff(
    dayjs(stage.actualStart),
    "day"
  );
  const hasActualDates = stage.actualStart;

  return (
    <div className="ppw-dates-container">
      <Text type={hasActualDates ? "secondary" : undefined}>
        <span>Plan: </span>
        <span>{formatDate(stage.planStart, locale)}</span>
        <span> — </span>
        <span>{formatDate(stage.planEnd, locale)}</span>
        <span>{` (${planDuration}d)`}</span>
      </Text>
      {hasActualDates && (
        <>
          <Text>→</Text>
          <Text>
            <span>Actual: </span>
            <span>{formatDate(stage.actualStart, locale)}</span>
            <span> — </span>
            <span>
              {stage.actualEnd ? formatDate(stage.actualEnd, locale) : "..."}
            </span>
            <span>{stage.actualEnd && ` (${actualDuration}d)`}</span>
          </Text>
        </>
      )}
    </div>
  );
};

interface BudgetProps {
  totalBudget: number;
  totalSpent: number;
  status: ProjectPlanJob["status"];
  currency: string;
}

const Budget: React.FC<BudgetProps> = ({
  totalBudget,
  totalSpent,
  status,
  currency,
}) => {
  const locale = "ru-RU";
  const progressPercentage = Math.min((totalSpent / totalBudget) * 100, 100);
  const hasOverspend = totalSpent > totalBudget;
  const overspendAmount = totalSpent - totalBudget;
  const isCriticalOverspend = totalSpent > totalBudget * 1.2;
  return (
    <div className="StageCard-budget">
      <div className="ppw-budget-header">
        <Text>Budget</Text>
        {hasOverspend && (
          <Text type={isCriticalOverspend ? "danger" : undefined}>
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
        status={
          isCriticalOverspend
            ? "exception"
            : status === "completed"
            ? "success"
            : "normal"
        }
      />
    </div>
  );
};

function StageStatus({ stage }: { stage: ProjectPlanJob }) {
  return (
    <div className={`StageCard-status _${stage.status}`}>
      <span className="StageCard-status-label">
        {getBadgeStatus(stage.status).text}
      </span>
      <DatesDisplay stage={stage} />
    </div>
  );
}

function StageItem({ name, value }: { name: string; value?: number }) {
  return (
    <div className="StageCard-details-row">
      <div className="StageCard-details-row-name">{name}</div>
      <div className="StageCard-details-row-value">{value}</div>
    </div>
  );
}

function StageDetails({ stage }: { stage: ProjectPlanJob }) {
  return (
    <div className="StageCard-details">
      <div className="StageCard-details-item StageCard-outcomes">
        <div>
          <Text strong>Outcomes</Text>
        </div>
        {stage.outcomes && stage.outcomes.length > 0 ? (
          stage.outcomes.map((item) => (
            <StageItem key={item.id} name={item.name} />
          ))
        ) : (
          <Text type="secondary">No expected outcomes</Text>
        )}
      </div>
      <div className="StageCard-details-separator" />
      <div className="StageCard-details-item StageCard-resources">
        <div>
          <Text strong>Resources</Text>
        </div>
        {stage.totalResources && stage.totalResources.length > 0 ? (
          stage.totalResources.map((item, i) => (
            <StageItem
              key={i}
              name={getResourceName(item)}
              value={getResourceValue(item)}
            />
          ))
        ) : (
          <Text type="secondary">No planned resources</Text>
        )}
      </div>
    </div>
  );
}

interface StageCardProps {
  stage: ProjectPlanJob;
  contract: Project["activeContract"];
  memberships: Project["memberships"];
  currency: string;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  contract,
  memberships,
  currency,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(
    stage.status === "inProgress"
  );
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
    <div className="StageCard">
      <StageStatus stage={stage} />
      <div className="StageCard-content">
        <div className="StageCard-header">
          <div className="StageCard-header-title">
            <Title level={5}>{stage.name}</Title>
            {stage.status !== "inProgress" && (
              <Button
                className="StageCard-header-expandButton"
                size="small"
                color="default"
                variant="link"
                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
          </div>
          <Button type="link" onClick={() => {}}>
            Actions
          </Button>
        </div>
        {(isExpanded || stage.status === "inProgress") && (
          <div className="StageCard-expandedContent">
            <Budget
              totalBudget={stage.totalBudget}
              totalSpent={totalMoney}
              status={stage.status}
              currency={currency}
            />
            <StageDetails stage={stage} />
            {unknownRoleDuration > 0 && (
              <div className="ppw-stage-warning">
                Resources without project role: {unknownRoleDuration / 60}h
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PlanSummary: React.FC<ProjectPlanWidgetProps> = ({
  project,
  currency = "RUB",
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
          />
        ))}
      </div>
    </div>
  );
};
