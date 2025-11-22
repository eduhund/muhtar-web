import { Card, Descriptions, Statistic, Tooltip } from "antd";
import { Project } from "../../../../context/AppContext";

export default function DatesSummary({ project }: { project: Project }) {
  const now = new Date();
  const deadline = project.plan?.deadline
    ? new Date(project.plan.deadline)
    : null;
  const daysRemaining = deadline
    ? Math.max(
        0,
        Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
    : null;
  return (
    <Card variant="borderless" className="ProjectWidget DatesSummary">
      <div className="ProjectWidget-body">
        <Tooltip placement="bottomLeft">
          <Statistic
            title="Days remaining"
            value={daysRemaining ?? 0}
            groupSeparator={" "}
            decimalSeparator={","}
            precision={0}
            prefix={null}
            suffix="days"
          />
        </Tooltip>
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="End date">
            {project.plan?.deadline ?? "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
}
