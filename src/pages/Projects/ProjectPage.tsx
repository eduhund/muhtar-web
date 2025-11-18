import { Tabs, Typography } from "antd";

import { Project } from "../../context/AppContext";

import type { TabsProps } from "antd";
import Overview from "./subpages/Overview/Overview";
import { useParams } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";

const { Title } = Typography;

export default function ProjectPage({ project }: { project?: Project }) {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProjects();

  const currentProject =
    project || (projectId ? projects?.find((p) => p.id === projectId) : null);

  if (!currentProject) {
    return (
      <div>
        <Title level={2}>Project not found</Title>
      </div>
    );
  }
  const ProjectTabs: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children: <Overview project={currentProject} />,
    },
    {
      key: "2",
      label: "Timeline",
      children: "Content of Tab Pane 2",
    },
  ];

  return (
    <div>
      <Title level={2}>{currentProject.name}</Title>
      <Tabs defaultActiveKey="1" items={ProjectTabs} />
    </div>
  );
}
