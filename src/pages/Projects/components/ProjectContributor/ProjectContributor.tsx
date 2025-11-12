import { Button, message } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

import { useProjects } from "../../../../hooks/useProjects";
import { Project } from "../../../../context/AppContext";

import "./ProjectContributor.scss";

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
  const [messageApi, contextHolder] = message.useMessage();

  const showSuccessMessage = () => {
    messageApi.open({
      type: "success",
      content: `Member added to the project!`,
    });
  };

  const showErrorMessage = () => {
    messageApi.open({
      type: "error",
      content: `Member was not added!`,
    });
  };

  async function handleAddToProject() {
    const success = await addProjectMembership(project.id, {
      membershipId: contributor.contributorId,
      accessRole: "member",
      workRole: "staff",
      multiplier: 1,
    });
    if (success) {
      showSuccessMessage();
    } else {
      showErrorMessage();
    }
  }
  return (
    <div className="ProjectContributor">
      {contextHolder}
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
