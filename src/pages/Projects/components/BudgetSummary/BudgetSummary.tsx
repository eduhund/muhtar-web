import { Descriptions, Statistic, Tooltip } from "antd";
import { Project } from "../../../../context/AppContext";
import { getCurrencySymbol } from "../../../../utils/currencies";
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

export default function BudgetSummary({
  project,
  totalSpent,
}: {
  project: Project;
  totalSpent: number;
}) {
  const currencySymbol = getCurrencySymbol(project.contract?.currency ?? "USD");
  const budget = project.plan?.totalBudget ?? 0;
  const isWarning = totalSpent > budget * 0.8 && totalSpent <= budget;
  const isAlarm = totalSpent > budget;
  return (
    <div className="ProjectWidget BudgetSummary">
      <Tooltip
        title={
          isAlarm
            ? `You have exceeded the budget by ${
                totalSpent - budget
              } ${currencySymbol}`
            : `${budget - totalSpent} ${currencySymbol} remaining`
        }
        placement="bottomLeft"
      >
        <Statistic
          title="Budget spent"
          value={totalSpent}
          prefix={
            isAlarm ? (
              <CloseCircleOutlined />
            ) : isWarning ? (
              <ExclamationCircleOutlined />
            ) : undefined
          }
          suffix={currencySymbol}
        />
      </Tooltip>
      <Descriptions size="small" column={1}>
        <Descriptions.Item label="Total budget">
          {project.plan?.totalBudget ?? 0} {currencySymbol}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
}
