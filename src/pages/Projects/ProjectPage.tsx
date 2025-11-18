import { Tabs, Typography } from "antd";

import { Project } from "../../context/AppContext";

import type { TabsProps } from "antd";
import Overview from "./subpages/Overview/Overview";

const { Title } = Typography;

export default function ProjectPage({ project }: { project: Project }) {
  const ProjectTabs: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children: <Overview project={project} />,
    },
    {
      key: "2",
      label: "Timeline",
      children: "Content of Tab Pane 2",
    },
  ];

  return (
    <div>
      <Title level={2}>{project.name}</Title>
      <Tabs defaultActiveKey="1" items={ProjectTabs} />
    </div>
  );
}
