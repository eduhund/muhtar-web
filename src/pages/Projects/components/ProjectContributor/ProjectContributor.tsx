import { Button } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

import { useProjects } from "../../../../hooks/useProjects";
import { Project } from "../../../../context/AppContext";

import "./ProjectContributor.scss";
import { useUIMessages } from "../../../../providers/UIMessageProvider";

type ProjectContributorProps = {
  project: Project;
  contributor: {
    contributorId: string;
    contributorName: string;
    duration: number;
  };
};

export default function ProjectContributor({
  project,
  contributor,
}: ProjectContributorProps) {
  const { addProjectMembership } = useProjects();
  const UIMessages = useUIMessages();

  async function handleAddToProject() {
    const success = await addProjectMembership(project.id, {
      membershipId: contributor.contributorId,
      accessRole: "member",
      workRole: "staff",
      multiplier: 1,
    });
    if (success) {
      UIMessages?.addProjectMember.success();
    } else {
      UIMessages?.addProjectMember.error();
    }
  }
  return (
    <div className="ProjectContributor">
      <div className="ProjectContributor-info">
        <div className="ProjectContributor-name">
          {contributor.contributorName}
        </div>
      </div>
      <div className="ProjectContributor-duration">
        Spent: {contributor.duration} hours
      </div>
      <div className="ProjectContributor-actions">
        <Button
          type="link"
          title="Add to Project"
          icon={<PlusCircleOutlined />}
          onClick={handleAddToProject}
        ></Button>
      </div>
    </div>
  );
}
