import { Typography } from "antd";
import { useProjects } from "../../hooks/useProjects";
import Page from "../../components/Page/Page";
import SideList from "../../components/SideList/SideList";
import { useEffect, useState } from "react";
import { Project, TimetableItem } from "../../context/AppContext";
import ProjectPage from "./ProjectPage";
import { useTimetable } from "../../hooks/useTimetable";
import QuickSummaryItem from "../Workers/components/QuickSummaryItem/QuickSummaryItem";
import dayjs from "dayjs";

import "./Projects.scss";
import { useParams } from "react-router-dom";

const { Title, Paragraph } = Typography;

type Period = "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

function filterByPeriod(
  entries: TimetableItem[],
  period: Period
): TimetableItem[] {
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
  const { timetable } = useTimetable();

  const projectEntries =
    timetable?.filter((item) => item.project.id === project.id) || [];

  const thisMonthEntries = filterByPeriod(projectEntries, "thisMonth");
  const totalDuration =
    projectEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours

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

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { projects } = useProjects();

  useEffect(() => {
    if (selectedProject && projects) {
      const updated = projects.find((p) => p.id === selectedProject.id);
      if (updated && updated !== selectedProject) {
        setSelectedProject(updated);
      }
      if (!updated) {
        setSelectedProject(null);
      }
    }
  }, [projects, selectedProject]);

  const activeProjects = (projects || [])?.filter(
    (project) => project.status === "active"
  );

  return (
    <Page title="Projects">
      <div className="Projects">
        <SideList>
          {activeProjects && (
            <div className="Projects-group">
              <div className="Projects-list">
                {activeProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    isSelected={project.id === selectedProject?.id}
                    onClick={() => setSelectedProject(project)}
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
              <Paragraph>
                Please select a project from the list to view detailed
                statistics.
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
