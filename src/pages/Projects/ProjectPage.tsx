import { Typography } from "antd";

import { Project } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";

const { Title } = Typography;

export default function ProjectPage({ project }: { project: Project }) {
  const { timetable } = useTimetable();
  const projectEntries =
    timetable?.filter((item) => item.project.id === project.id) || [];

  console.log("Project entries:", projectEntries.length);

  return (
    <div>
      <Title level={2}>{project.name}</Title>
    </div>
  );
}
