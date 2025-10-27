import { Typography } from "antd";
import { useProjects } from "../../hooks/useProjects";
import PageHeader from "../../components/PageHeader/PageHeader";

const { Title } = Typography;

export function Projects() {
  const { projects } = useProjects();

  const activeProjects = (projects || [])?.filter(
    (project) => project.status === "active"
  );

  return (
    <div className="Projects">
      <PageHeader title="Projects" />
      <div className="Workers-content">
        {activeProjects?.map((project) => (
          <div key={project.id} className="Project-row">
            {project.customer && <p>{project.customer}</p>}
            <Title level={4}>{project.name}</Title>
          </div>
        ))}
      </div>
    </div>
  );
}
