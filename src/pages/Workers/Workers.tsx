import { Statistic, Typography } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemberships } from "../../hooks/useMemberships";
import { Membership, TimetableItem } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMembership } from "../../hooks/useMembership";
import { Navigate } from "react-router-dom";
//import { BarChart, Bar, Tooltip, TooltipContentProps, YAxis } from "recharts";

import "./Workers.scss";
//import { useProjects } from "../../hooks/useProjects";
import Page from "../../components/Page/Page";
import SideList from "../../components/SideList/SideList";
import { useState } from "react";

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

/*
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
  const formattedResult = result.map((item) => ({
    date: dayjs(item.date).format("D MMMM"),
    duration: item.duration / 60, // in hours
  }));
  return formattedResult;
}
  */

function WorkerRow({
  membership,
  isSelected,
  onClick,
}: {
  membership: Membership;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { timetable } = useTimetable();
  //const { projects } = useProjects();

  /*
  const membershipProjectsQt = (projects || [])?.filter((project) =>
    project?.memberships.some((m) => m.membershipId === membership.id)
  ).length;
  */

  const membershipEntries =
    timetable?.filter((item) => item.membership.id === membership.id) || [];

  /*
  const lastTrackedEntry = membershipEntries.sort((a, b) => b.ts - a.ts)[0];
  const lastTrackedDate = lastTrackedEntry?.ts
    ? dayjs(lastTrackedEntry?.ts).format("D MMMM YYYY")
    : "Never";
  */

  const thisWeekEntries = filterByPeriod(membershipEntries, "thisWeek");
  const thisMonthEntries = filterByPeriod(membershipEntries, "thisMonth");
  const totalWeekDuration =
    thisWeekEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours

  /*
  const lastFiveDaysData = getLast5DaysSummary(thisWeekEntries);

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipContentProps<string | number, string>) => {
    const isVisible = active && payload && payload.length;
    return (
      <div
        className="WorkerRow-chart-tooltip"
        style={{ visibility: isVisible ? "visible" : "hidden" }}
      >
        {isVisible && (
          <>
            <p className="label">{payload[0].payload.date}</p>
            <p className="value">
              Spent <strong>{payload[0].payload.duration}</strong>
            </p>
          </>
        )}
      </div>
    );
  };
  */

  /*
  const TinyBarChart = () => {
    return (
      <BarChart
        style={{
          width: "150px",
          maxHeight: "100px",
        }}
        responsive
        data={lastFiveDaysData}
      >
        <YAxis domain={[0, 8]} hide={true} />
        <Tooltip content={CustomTooltip} cursor={false} />
        <Bar
          dataKey="duration"
          fill="#f04f23"
          background={{ fill: "rgba(0, 0, 0, 0.04)" }}
        />
      </BarChart>
    );
  };
  */

  return (
    <div
      className={"SideList-item WorkerRow" + (isSelected ? " _selected" : "")}
      onClick={onClick}
    >
      <div className="WorkerRow-headline">
        <Title level={5}>{membership.name}</Title>
        <Paragraph type="secondary">
          {membership.contract[0]?.type || "No contract"}
        </Paragraph>
      </div>
      <div className="WorkerRow-params">
        <Statistic title="This week" value={totalWeekDuration.toFixed(0)} />
        <Statistic title="This month" value={totalMonthDuration.toFixed(0)} />
      </div>
    </div>
  );
}

export function Workers() {
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const { membership } = useMembership();
  const { memberships } = useMemberships();

  if (membership?.accessRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  const sortedMemberships = memberships?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Page title="Workers">
      <div className="Workers">
        <SideList>
          {sortedMemberships && (
            <div className="Workers-group">
              <div className="Workers-list">
                {sortedMemberships.map((membership) => (
                  <WorkerRow
                    key={membership.id}
                    membership={membership}
                    isSelected={membership.id === selectedMembership?.id}
                    onClick={() => setSelectedMembership(membership)}
                  ></WorkerRow>
                ))}
              </div>
            </div>
          )}
        </SideList>
        <div className="Workers-content">
          {selectedMembership ? (
            <div>
              <Title level={2}>{selectedMembership.name}</Title>
              <Paragraph>
                Detailed statistics for {selectedMembership.name} will be
                available soon.
              </Paragraph>
            </div>
          ) : (
            <div>
              <Title level={2}>Select a worker</Title>
              <Paragraph>
                Please select a worker from the list to view detailed
                statistics.
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
