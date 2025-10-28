import { Typography } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemberships } from "../../hooks/useMemberships";
import { Membership, TimetableItem } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMembership } from "../../hooks/useMembership";
import { Navigate } from "react-router-dom";

import "./Workers.scss";
//import { useProjects } from "../../hooks/useProjects";
import Page from "../../components/Page/Page";
import SideList from "../../components/SideList/SideList";
import { useState } from "react";
import QuickSummaryItem from "./components/QuickSummaryItem/QuickSummaryItem";
import WorkerPage from "./WorkerPage";

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

  const membershipEntries =
    timetable?.filter((item) => item.membership.id === membership.id) || [];

  const thisWeekEntries = filterByPeriod(membershipEntries, "thisWeek");
  const thisMonthEntries = filterByPeriod(membershipEntries, "thisMonth");
  const totalWeekDuration =
    thisWeekEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.duration, 0) / 60; // in hours

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
      <div className="WorkerRow-summary">
        <QuickSummaryItem title="This week" value={totalWeekDuration} />
        <QuickSummaryItem title="This month" value={totalMonthDuration} />
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
            <WorkerPage membership={selectedMembership} />
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
