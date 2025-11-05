import { Typography } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Project } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMemberships } from "../../hooks/useMemberships";
import dayjs from "dayjs";

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
  const { timetable } = useTimetable();
  const { memberships } = useMemberships();
  const projectEntries =
    timetable?.filter((item) => item.project.id === project.id) || [];

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
        multiplier: number;
      }>;
    }> = [];
    uniqueDates.forEach((date) => {
      const dayEntries = sortedEntries.filter((e) => e.date === date);
      dayEntries.forEach((entry) => {
        const membershipId = entry.membership.id;
        const multiplier =
          project.memberships.find((m) => m.membershipId === membershipId)
            ?.multiplier || 1;
        if (!runningTotals[membershipId]) runningTotals[membershipId] = 0;
        runningTotals[membershipId] += (entry.duration / 60) * multiplier;
      });
      const workers = Object.keys(runningTotals).map((membershipId) => {
        const membershipName =
          memberships?.find((m) => m.id === membershipId)?.name || "Unknown";
        const multiplier =
          project.memberships.find((m) => m.membershipId === membershipId)
            ?.multiplier || 1;
        return {
          membershipId,
          membershipName,
          value: runningTotals[membershipId],
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

  const durationPerWorker: Record<string, number> = {};
  projectEntries.forEach((entry) => {
    const workerId = entry.membership.id;
    if (!durationPerWorker[workerId]) {
      durationPerWorker[workerId] = 0;
    }
    durationPerWorker[workerId] += entry.duration / 60; // in hours
  });

  const durationEntries = Object.entries(durationPerWorker)
    .map(([membershipId, duration]) => ({
      membershipId,
      membershipName: memberships
        ? memberships.find((m) => m.id === membershipId)?.name
        : "Unknown",
      multiplier:
        project.memberships.find((m) => m.membershipId === membershipId)
          ?.multiplier || 1,
      duration,
    }))
    .sort((a: any, b: any) => a.membershipName.localeCompare(b.membershipName));

  const coreTeamEntires = durationEntries.filter((entry) =>
    project.memberships.some((m) => m.membershipId === entry.membershipId)
  );

  const otherEntries = durationEntries.filter(
    (entry) =>
      !project.memberships.some((m) => m.membershipId === entry.membershipId)
  );

  const coreTeamDuration = coreTeamEntires.reduce(
    (acc, entry) => acc + entry.duration * entry.multiplier,
    0
  );
  const otherDuration = otherEntries.reduce(
    (acc, entry) => acc + entry.duration * entry.multiplier,
    0
  );

  const totalDuration = coreTeamDuration + otherDuration;

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

  return (
    <div>
      <Title level={2}>{project.name}</Title>
      <p>
        Total Time Logged: {totalDuration} hours (Core Team: {coreTeamDuration}{" "}
        hours, Others: {otherDuration} hours)
      </p>
      <StackedAreaChart />
      <Title level={4}>Core Team</Title>
      <ul>
        {coreTeamEntires.map(
          ({ membershipId, membershipName, multiplier, duration }) => (
            <li key={membershipId}>
              {membershipName} (x{multiplier}): {duration * multiplier} hours
            </li>
          )
        )}
      </ul>
      <Title level={4}>Other Contributors</Title>
      <ul>
        {otherEntries.map(
          ({ membershipId, membershipName, multiplier, duration }) => (
            <li key={membershipId}>
              {membershipName} (x{multiplier}): {duration * multiplier} hours
            </li>
          )
        )}
      </ul>
    </div>
  );
}
