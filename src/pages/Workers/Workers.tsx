import { Col, Row, Statistic, Typography } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemberships } from "../../hooks/useMemberships";
import { Membership, TimetableItem } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMembership } from "../../hooks/useMembership";
import { Navigate } from "react-router-dom";
import { BarChart, Bar } from "recharts";

import "./Workers.scss";
import { useProjects } from "../../hooks/useProjects";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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

function getLast5DaysSummary(
  entries: TimetableItem[]
): { date: string; duration: number }[] {
  const result: { date: string; duration: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
    const duration = entries
      .filter((e) => e.date === date)
      .reduce((acc, e) => acc + (e.duration || 0), 0);
    result.unshift({ date, duration });
  }
  return result;
}

function WorkerRow({ membership }: { membership: Membership }) {
  const { timetable } = useTimetable();
  const { projects } = useProjects();

  const membershipProjectsQt = (projects || [])?.filter((project) =>
    project?.memberships.some((m) => m.membershipId === membership.id)
  ).length;

  const membershipEntries =
    timetable?.filter((item) => item.membership.id === membership.id) || [];

  const lastTrackedEntry = membershipEntries.sort((a, b) => b.ts - a.ts)[0];
  const lastTrackedDate = lastTrackedEntry?.ts
    ? dayjs(lastTrackedEntry?.ts).format("D MMMM YYYY")
    : "Never";

  const thisWeekEntries = filterByPeriod(membershipEntries, "thisWeek");
  const thisMonthEntries = filterByPeriod(membershipEntries, "thisMonth");
  const totalWeekDuration =
    thisWeekEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours

  const lastFiveDaysData = getLast5DaysSummary(thisWeekEntries);

  return (
    <div className="WorkerRow">
      <div className="WorkerRow-headline">
        <Title level={4}>{membership.name}</Title>
        <Paragraph type="secondary">
          <strong>{membershipProjectsQt}</strong> active projects
        </Paragraph>
        <Paragraph type="secondary">
          Last tracked time: <strong>{lastTrackedDate}</strong>
        </Paragraph>
      </div>
      <div className="WorkerRow-params">
        <BarChart
          style={{
            maxWidth: "300px",
            maxHeight: "100px",
          }}
          responsive
          data={lastFiveDaysData}
        >
          <Bar dataKey="duration" fill="#f04f23" />
        </BarChart>
        <Statistic
          title="Spent this week"
          value={totalWeekDuration.toFixed(0)}
        />
        <Statistic
          title="Spent this month"
          value={totalMonthDuration.toFixed(0)}
        />
      </div>
    </div>
  );
}

export function Workers() {
  const { membership } = useMembership();
  const { memberships } = useMemberships();

  if (
    membership &&
    (membership.accessRole === "member" || membership.accessRole === "guest")
  ) {
    return <Navigate to="/" replace />;
  }

  const sortedMemberships = memberships?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const staff = sortedMemberships?.filter(
    (membership) =>
      membership?.contract?.type === "staff" && membership.status === "active"
  );
  const freelancers = sortedMemberships?.filter(
    (membership) =>
      membership?.contract?.type === "freelance" &&
      membership.status === "active"
  );

  return (
    <div className="Workers">
      <div className="Workers-header">
        <div className="Workers-header-title">
          <Title level={1}>Workers</Title>
        </div>
      </div>
      <div className="Workers-content">
        {staff && (
          <div className="Workers-group">
            <Title level={2}>Core team</Title>
            <div className="Workers-list">
              {staff.map((membership) => (
                <WorkerRow
                  key={membership.id}
                  membership={membership}
                ></WorkerRow>
              ))}
            </div>
          </div>
        )}
        {freelancers && freelancers.length > 0 && (
          <div className="Workers-group">
            <Title level={2}>Freelancers</Title>
            <div className="Workers-list">
              {freelancers.map((membership) => (
                <WorkerRow
                  key={membership.id}
                  membership={membership}
                ></WorkerRow>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
