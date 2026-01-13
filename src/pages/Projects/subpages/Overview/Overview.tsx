import { Button, Col, Row, Typography } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Project } from "../../../../context/AppContext";
import { useResources } from "../../../../hooks/useResources";
import { useMemberships } from "../../../../hooks/useMemberships";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import AddToProjectModal from "../../components/AddToProjectModal";
import ProjectMembership from "../../components/ProjectMembership/ProjectMembership";
import ProjectContributor from "../../components/ProjectContributor/ProjectContributor";
//import { useTasks } from "../../../../hooks/useTasks";
//import ProjectTask from "../../components/ProjectTask/ProjectTask";
import AddTaskModal from "../../components/AddTaskModal/AddTaskModal";
import BudgetSummary from "../../components/BudgetSummary/BudgetSummary";
import DatesSummary from "../../components/DatesSummary/DatesSummary";
import { PlanSummary } from "../../components/PlanSummary/PlanSummary";
import ResourcesSummary from "../../components/ResourcesSummary/ResourcesSummary";

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

export default function Overview({ project }: { project: Project }) {
  const [modals, setModals] = useState({
    addToProject: false,
    addTask: false,
  });
  const { resources } = useResources();
  const { memberships } = useMemberships();
  //const { tasks } = useTasks();
  const projectEntries =
    resources?.filter((item) => item.project.id === project.id) || [];
  function openModal(modalName: keyof typeof modals) {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  }
  function closeModal(modalName: keyof typeof modals) {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  }

  /*
  const filteredTasks = tasks?.filter(
    (task) => task.project?.id === project.id
  );
  */

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
        runningTotals[membershipId] += (entry.consumed / 60) * multiplier;
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

  const lastDay = groupedEntries[groupedEntries.length - 1];
  const totalDurationByLastDay = lastDay
    ? lastDay.workers.reduce((acc, worker) => {
        const workerRoleCost =
          project?.activeContract?.roles
            ?.find((role) => (role.key || role.name) === worker.workRole)
            ?.resources?.find((resource) => resource.type === "time")
            ?.costPerUnit.amount || 0;
        return acc + worker.value * workerRoleCost;
      }, 0)
    : 0;

  const StackedAreaChart = useCallback(() => {
    const allWorkerIds = Array.from(
      new Set(
        groupedEntries.flatMap((day) => day.workers.map((w) => w.membershipId))
      )
    );
    return (
      <div>
        <Title level={4}>Time Logged</Title>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
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
        </ResponsiveContainer>
      </div>
    );
  }, [chartData, groupedEntries, memberships]);

  return (
    <div className="ProjectPage-overview">
      <Row gutter={16}>
        <Col span={8}>
          <BudgetSummary
            project={project}
            totalSpent={totalDurationByLastDay}
          />
        </Col>
        <Col span={8}>
          <ResourcesSummary project={project} totalSpent={totalDuration} />
        </Col>
        <Col span={8}>
          <DatesSummary project={project} />
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 32 }}>
        <Col span={12}>
          <StackedAreaChart />
        </Col>
        <Col span={12}>
          <PlanSummary project={project} />
        </Col>
      </Row>
      {/*<div className="ProjectPage-tasks">
        <div className="ProjectPage-block-header">
          <Title level={4}>Tasks</Title>
          <Button type="link" onClick={() => openModal("addTask")}>
            Add new Task
          </Button>
        </div>

        {filteredTasks && filteredTasks.length > 0 ? (
          <div className="ProjectPage-tasks-list">
            {filteredTasks.map((task) => (
              <ProjectTask key={task.id} task={task} project={project} />
            ))}
          </div>
        ) : (
          <p>No tasks found for this project.</p>
        )}
      </div>*/}
      <div className="ProjectPage-block-header">
        <Title level={4}>Core Team</Title>{" "}
        <Button type="link" onClick={() => openModal("addToProject")}>
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
      <div className="ProjectPage-block-header">
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
        isOpen={modals.addToProject}
        project={project}
        onClose={() => closeModal("addToProject")}
      />
      <AddTaskModal
        isOpen={modals.addTask}
        project={project}
        onClose={() => closeModal("addTask")}
      />
    </div>
  );
}
