import { Typography } from "antd";
import { useProjects } from "../../hooks/useProjects";

const { Title } = Typography;

export function Projects() {
  const { projects } = useProjects();

  const activeProjects = (projects || [])?.filter(
    (project) => project.status === "active"
  );

  return (
    <div className="Projects">
      <div className="Projects-header">
        <div className="Projects-header-title">
          <Title level={1}>Projects</Title>
          <div className="Workers-content">
            {activeProjects?.map((project) => (
              <div key={project.id} className="Project-row">
                {project.customer && <p>{project.customer}</p>}
                <Title level={4}>{project.name}</Title>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
