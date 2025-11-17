import { Button, Checkbox, Typography } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Project, Task } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMemberships } from "../../hooks/useMemberships";
import dayjs from "dayjs";
import { useState } from "react";
import AddToProjectModal from "./components/AddToProjectModal";
import ProjectMembership from "./components/ProjectMembership/ProjectMembership";
import ProjectContributor from "./components/ProjectContributor/ProjectContributor";
import { useTasks } from "../../hooks/useTasks";

const { Title } = Typography;

const areaColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#a4de6c",
  "#d0ed57",
  "#8dd1e1",
];

export default function ProjectPage({ project }: { project: Project }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { timetable } = useTimetable();
  const { memberships } = useMemberships();
  const { tasks, updateTask } = useTasks();
  const projectEntries =
    timetable?.filter((item) => item.project.id === project.id) || [];

  function openModal() {
    setIsOpenModal(true);
  }
  function closeModal() {
    setIsOpenModal(false);
  }

  const filteredTasks = tasks?.filter(
    (task) => task.project?.id === project.id
  );

  function groupEntriesByDayWithWorkers(entries: typeof projectEntries) {
    const sortedEntries = [...entries].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    const uniqueDates = Array.from(
      new Set(sortedEntries.map((e) => e.date))
    ).sort();
    const runningTotals: Record<string, number> = {};
    const result: Array<{
      date: string;
      workers: Array<{
        membershipId: string;
        membershipName: string;
        value: number;
        accessRole: string;
        workRole: string;
        multiplier: number;
      }>;
    }> = [];
    const activeMembershipIds = Array.from(
      new Set(entries.map((e) => e.membership.id))
    );
    uniqueDates.forEach((date) => {
      const dayEntries = sortedEntries.filter((e) => e.date === date);
      dayEntries.forEach((entry) => {
        const membershipId = entry.membership.id;
        const multiplier =
          project.memberships.find((m) => m.membershipId === membershipId)
            ?.multiplier || 1;
        if (!runningTotals[membershipId]) runningTotals[membershipId] = 0;
        runningTotals[membershipId] += (entry.duration / 60) * multiplier;
        runningTotals[membershipId] =
          Math.round(runningTotals[membershipId] * 2) / 2;
      });
      const workers = activeMembershipIds.map((membershipId) => {
        const membershipName =
          memberships?.find((m) => m.id === membershipId)?.name || "Unknown";
        const multiplier =
          project.memberships.find((m) => m.membershipId === membershipId)
            ?.multiplier || 1;
        return {
          membershipId,
          membershipName,
          value: runningTotals[membershipId] || 0,
          accessRole:
            project.memberships.find((m) => m.membershipId === membershipId)
              ?.accessRole || "Unknown",
          workRole:
            project.memberships.find((m) => m.membershipId === membershipId)
              ?.workRole || "Unknown",
          multiplier,
        };
      });
      result.push({
        date: dayjs(date).format("D MMMM YYYY"),
        workers,
      });
    });
    return result;
  }

  const groupedEntries = groupEntriesByDayWithWorkers(projectEntries);
  const chartData = groupedEntries.map((day) => {
    const formattedDate = day.date
      ? new Date(day.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : day.date;
    const obj: Record<string, number | string> = { date: formattedDate };
    day.workers.forEach((worker) => {
      obj[worker.membershipId] = worker.value;
    });
    return obj;
  });

  const durationEntries = groupedEntries[
    groupedEntries.length - 1
  ]?.workers?.map((worker) => ({
    membershipId: worker.membershipId,
    membershipName: worker.membershipName,
    multiplier: worker.multiplier,
    accessRole: worker.accessRole,
    workRole: worker.workRole,
    duration: worker.value,
  }));

  const coreTeamEntires = durationEntries?.filter((entry) =>
    project.memberships.some((m) => m.membershipId === entry.membershipId)
  );

  const otherEntries = durationEntries?.filter(
    (entry) =>
      !project.memberships.some((m) => m.membershipId === entry.membershipId)
  );

  const coreTeamDuration = coreTeamEntires?.reduce(
    (acc, entry) => acc + entry.duration * entry.multiplier,
    0
  );
  const otherDuration = otherEntries?.reduce(
    (acc, entry) => acc + entry.duration * entry.multiplier,
    0
  );

  const totalDuration = coreTeamDuration + otherDuration;

  async function handleTaskDoneChange(taskId: string, checked: boolean) {
    await updateTask({
      id: taskId,
      doneDate: checked ? dayjs().toISOString() : null,
    });
  }

  const StackedAreaChart = () => {
    const allWorkerIds = Array.from(
      new Set(
        groupedEntries.flatMap((day) => day.workers.map((w) => w.membershipId))
      )
    );
    return (
      <AreaChart
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "70vh",
          aspectRatio: 1.618,
        }}
        data={chartData}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis width="auto" />
        <Tooltip />
        {allWorkerIds.map((workerId, idx) => {
          const workerName =
            memberships?.find((m) => m.id === workerId)?.name || workerId;
          const color = areaColors[idx % areaColors.length];
          return (
            <Area
              key={workerId}
              type="monotone"
              dataKey={workerId}
              name={workerName}
              stackId={1}
              stroke={color}
              fill={color}
            />
          );
        })}
      </AreaChart>
    );
  };

  function renderTaskDuration(task: Task) {
    if (!task.duration) return null;
    if (Array.isArray(task.duration)) {
      const [min, max] = task.duration;
      return `${min / 60}-${max / 60}h`;
    } else {
      return `${task.duration / 60}h`;
    }
  }

  return (
    <div>
      <Title level={2}>{project.name}</Title>
      <p>
        Total Time Logged: {Number(totalDuration).toFixed(0)} hours (Core Team:{" "}
        {Number(coreTeamDuration).toFixed(0)} hours, Others:{" "}
        {Number(otherDuration).toFixed(0)} hours)
      </p>
      <StackedAreaChart />
      <div className="ProjectPage-tasks">
        <Title level={4}>Tasks</Title>
        {filteredTasks && filteredTasks.length > 0 ? (
          <div className="ProjectPage-tasks-list">
            {filteredTasks.map((task) => (
              <Checkbox
                key={task.id}
                checked={!!task.doneDate}
                onChange={(e) =>
                  handleTaskDoneChange(task.id, e.target.checked)
                }
              >
                <div>{task.name}</div>
                <div className="ProjectPage-tasks-dates">
                  {task.startDate
                    ? dayjs(task.startDate).format("D MMM")
                    : "N/A"}{" "}
                  → {task.dueDate ? dayjs(task.dueDate).format("D MMM") : "N/A"}{" "}
                  {renderTaskDuration(task)}
                </div>
                <div className="ProjectPage-tasks-assigned">
                  {task.assignedMembership?.name}
                </div>
              </Checkbox>
            ))}
          </div>
        ) : (
          <p>No tasks found for this project.</p>
        )}
      </div>
      <div className="ProjectPage-members-header">
        <Title level={4}>Core Team</Title>{" "}
        <Button type="link" onClick={openModal}>
          Add Members
        </Button>
      </div>
      <div className="ProjectPage-members-list">
        {coreTeamEntires?.map(
          ({
            membershipId,
            membershipName,
            accessRole,
            workRole,
            multiplier,
            duration,
          }) => (
            <ProjectMembership
              key={membershipId}
              membership={{
                membershipId,
                membershipName,
                accessRole,
                workRole,
                duration,
                multiplier,
              }}
              project={project}
            />
          )
        )}
      </div>
      <div className="ProjectPage-members-header">
        <Title level={4}>Other Contributors</Title>
      </div>
      <div className="ProjectPage-members-list">
        {otherEntries?.map(({ membershipId, membershipName, duration }) => (
          <ProjectContributor
            key={membershipId}
            project={project}
            contributor={{
              contributorId: membershipId,
              contributorName: membershipName,
              duration,
            }}
          />
        ))}
      </div>

      <AddToProjectModal
        isOpen={isOpenModal}
        project={project}
        onClose={closeModal}
      />
    </div>
  );
}
