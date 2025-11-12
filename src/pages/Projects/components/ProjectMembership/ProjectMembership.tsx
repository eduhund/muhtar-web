import { CrownOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";

import "./ProjectMembership.scss";

type ProjectMembershipProps = {
  membership: {
    membershipId: string;
    membershipName: string;
    accessRole: string;
    workRole: string;
    duration: number;
    multiplier: number;
  };
  projectRoles: { value: string; label: string }[];
};

export default function ProjectMembership({
  membership,
  projectRoles,
}: ProjectMembershipProps) {
  return (
    <div className="ProjectMembership">
      <div className="ProjectMembership-info">
        <div className="ProjectMembership-name">
          {membership.membershipName}{" "}
          {membership.accessRole !== "admin" && (
            <CrownOutlined style={{ color: "#999999" }} />
          )}
        </div>
        <div className="ProjectMembership-role">
          {
            projectRoles.find((role) => role.value === membership.workRole)
              ?.label
          }
          , {membership.multiplier}x
        </div>
      </div>
      <div className="ProjectMembership-duration">
        Spent: {membership.duration} hours
      </div>
      <div className="ProjectMembership-actions">
        <Button
          type="link"
          title="Settings"
          icon={<SettingOutlined />}
        ></Button>
      </div>
    </div>
  );
}
