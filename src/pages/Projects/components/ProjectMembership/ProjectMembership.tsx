import { CrownOutlined, SettingOutlined } from "@ant-design/icons";
import { Button } from "antd";

import "./ProjectMembership.scss";
import { useState } from "react";
import EditMembershipModal from "../EditMembershipModal/EditMembershipModal";
import { Project } from "../../../../context/AppContext";

type ProjectMembershipProps = {
  membership: {
    membershipId: string;
    membershipName: string;
    accessRole: string;
    workRole: string;
    duration: number;
    multiplier: number;
  };
  project: Project;
};

export default function ProjectMembership({
  membership,
  project,
}: ProjectMembershipProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  function openEditModal() {
    setIsEditModalOpen(true);
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
  }

  const projectRoles = project.roles.map((role) => ({
    value: role.key,
    label: role.name,
  }));

  return (
    <div className="ProjectMembership">
      <div className="ProjectMembership-info">
        <div className="ProjectMembership-name">
          {membership.membershipName}{" "}
          {membership.accessRole === "admin" && (
            <CrownOutlined style={{ color: "#999999" }} />
          )}
        </div>
        <div className="ProjectMembership-role">
          {projectRoles.find((role) => role.value === membership.workRole)
            ?.label || "No role assigned"}
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
          onClick={openEditModal}
        ></Button>
      </div>
      <EditMembershipModal
        isOpen={isEditModalOpen}
        projectMembership={membership}
        project={project}
        onClose={closeEditModal}
      />
    </div>
  );
}
