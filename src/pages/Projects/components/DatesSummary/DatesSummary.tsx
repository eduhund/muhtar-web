import { Card, Descriptions, Statistic, Tooltip } from "antd";
import { Project } from "../../../../context/AppContext";
import dayjs from "dayjs";

export default function DatesSummary({ project }: { project: Project }) {
  const now = new Date();
  const startDate = project.activePlan?.planStart
    ? new Date(project.activePlan.planStart)
    : null;
  const deadline = project.activePlan?.planEnd
    ? new Date(project.activePlan.planEnd)
    : null;
  const daysRemaining = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statisticStyle =
    daysRemaining !== null && daysRemaining < 0
      ? { color: "#cf1322" } // Red color for overdue
      : {};

  return (
    <Card variant="borderless" className="ProjectWidget DatesSummary">
      <div className="ProjectWidget-body">
        <Tooltip placement="bottomLeft">
          <Statistic
            title="Days remaining"
            value={daysRemaining ?? 0}
            valueStyle={statisticStyle}
            groupSeparator={" "}
            decimalSeparator={","}
            precision={0}
            prefix={null}
            suffix="days"
          />
        </Tooltip>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Start date">
            {startDate ? dayjs(startDate).format("D MMMM YYYY") : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Deadline">
            {deadline ? dayjs(deadline).format("D MMMM YYYY") : "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
}
