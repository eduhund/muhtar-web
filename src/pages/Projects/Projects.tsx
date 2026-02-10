import { Typography } from "antd";
import { useProjects } from "../../hooks/useProjects";
import Page from "../../components/Page/Page";
import SideList from "../../components/SideList/SideList";
import { Project, Resource } from "../../context/AppContext";
import ProjectPage from "./ProjectPage";
import { useResources } from "../../hooks/useResources";
import QuickSummaryItem from "../Workers/components/QuickSummaryItem/QuickSummaryItem";
import dayjs from "dayjs";

import "./Projects.scss";
import { useParams, useNavigate } from "react-router-dom";
import { Timeline } from "../../components/Timeline/Timeline";

const { Title, Paragraph } = Typography;

type Period = "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

function filterByPeriod(entries: Resource[], period: Period): Resource[] {
  const today = dayjs();
  let start: dayjs.Dayjs, end: dayjs.Dayjs;

  if (period === "thisWeek") {
    start = today.startOf("isoWeek");
    end = today.endOf("day");
  } else if (period === "lastWeek") {
    start = today.subtract(1, "week").startOf("isoWeek");
    end = today.subtract(1, "week").endOf("isoWeek");
  } else if (period === "thisMonth") {
    start = today.startOf("month");
    end = today.endOf("day");
  } else if (period === "lastMonth") {
    start = today.subtract(1, "month").startOf("month");
    end = today.subtract(1, "month").endOf("month");
  } else {
    return entries;
  }

  return entries.filter((entry) => {
    const entryDate = dayjs(entry.date, "YYYY-MM-DD");
    return (
      entryDate.isSameOrAfter(start, "day") &&
      entryDate.isSameOrBefore(end, "day")
    );
  });
}

function ProjectRow({
  project,
  isSelected,
  onClick,
}: {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { resources } = useResources();

  const projectEntries =
    resources?.filter((item) => item.project.id === project.id) || [];

  const thisMonthEntries = filterByPeriod(projectEntries, "thisMonth");
  const totalDuration =
    projectEntries.reduce((acc, item) => acc + item.consumed, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.consumed, 0) / 60; // in hours

  return (
    <div
      className={"SideList-item ProjectRow" + (isSelected ? " _selected" : "")}
      onClick={onClick}
    >
      <div className="ProjectRow-headline">
        <Title level={5}>{project.name}</Title>
        <Paragraph type="secondary">
          {project.customer || "Single project"}
        </Paragraph>
      </div>
      <div className="ProjectRow-summary">
        <QuickSummaryItem title="This month" value={totalMonthDuration} />
        <QuickSummaryItem title="Total on project" value={totalDuration} />
      </div>
    </div>
  );
}

function OverviewRow({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={"SideList-item ProjectRow" + (isSelected ? " _selected" : "")}
      onClick={onClick}
    >
      <div className="ProjectRow-headline">
        <Title level={5}>Overview</Title>
      </div>
    </div>
  );
}

export function Projects() {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();

  const selectedProject = projectId
    ? projects?.find((p) => p.id === projectId) || null
    : null;

  const activeProjects = (projects || [])?.filter(
    (project) => project.status === "inProgress",
  );

  const projectsWithPlans = (projects || [])
    .filter((project) => project?.activePlan)
    .map((project) => ({
      name: project.name,
      status: project.status,
      ...project?.activePlan,
    }));
  return (
    <Page title="Projects">
      <div className="Projects">
        <SideList>
          <OverviewRow
            isSelected={!selectedProject}
            onClick={() => navigate("/projects")}
          />
          {activeProjects && (
            <div className="Projects-group">
              <div className="Projects-list">
                {activeProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    isSelected={project.id === selectedProject?.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </SideList>
        <div className="Projects-content">
          {selectedProject ? (
            <ProjectPage project={selectedProject} />
          ) : (
            <div>
              <Title level={2}>Select a Project</Title>
              <Timeline
                data={projectsWithPlans || []}
                defaultCollapsed={true}
              />
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
