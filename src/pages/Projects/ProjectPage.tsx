import { Typography } from "antd";

import { Project } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMemberships } from "../../hooks/useMemberships";

const { Title } = Typography;

export default function ProjectPage({ project }: { project: Project }) {
  const { timetable } = useTimetable();
  const { memberships } = useMemberships();
  const projectEntries =
    timetable?.filter((item) => item.project.id === project.id) || [];

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

  return (
    <div>
      <Title level={2}>{project.name}</Title>
      <p>
        Total Time Logged: {totalDuration} hours (Core Team: {coreTeamDuration}{" "}
        hours, Others: {otherDuration} hours)
      </p>
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
