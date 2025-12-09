import { Card, Descriptions, Statistic, Tooltip } from "antd";
import { Project } from "../../../../context/AppContext";

export default function ResourcesSummary({
  totalSpent,
  project,
}: {
  totalSpent: number;
  project: Project;
}) {
  const totalResources = project.activePlan?.totalResources[0]?.value ?? 0;
  const totalHours = totalResources / 60;
  const spentHours = Math.round(totalSpent);
  const remainingHours = totalHours - spentHours;

  const statisticStyle =
    remainingHours !== null && remainingHours < 0
      ? { color: "#cf1322" } // Red color for overdue
      : {};

  return (
    <Card variant="borderless" className="ProjectWidget ResourcesSummary">
      <div className="ProjectWidget-body">
        <Tooltip placement="bottomLeft">
          <Statistic
            title="Hours remaining"
            value={remainingHours ?? 0}
            valueStyle={statisticStyle}
            groupSeparator={" "}
            decimalSeparator={","}
            precision={0}
            prefix={null}
            suffix="hours"
          />
        </Tooltip>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Total hours">
            {totalHours} hours
          </Descriptions.Item>
          <Descriptions.Item label="Spent hours">
            {spentHours} hours
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
}
