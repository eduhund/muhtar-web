import { Typography } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import { useMemberships } from "../../hooks/useMemberships";
import { Membership, TimetableItem } from "../../context/AppContext";
import { useTimetable } from "../../hooks/useTimetable";
import { useMembership } from "../../hooks/useMembership";
import { Navigate } from "react-router-dom";

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

function WorkerRow({ membership }: { membership: Membership }) {
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
    <div className="WorkerRow">
      <Title level={4}>{membership.name}</Title>
      <Paragraph>
        Hours this week: <strong>{totalWeekDuration.toFixed(0)}</strong>
      </Paragraph>
      <Paragraph>
        Hours this month: <strong>{totalMonthDuration.toFixed(0)}</strong>
      </Paragraph>
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

  console.log("Memberships:", memberships);

  const staff = memberships?.filter(
    (membership) =>
      membership?.contract?.type === "staff" && membership.status === "active"
  );
  const freelancers = memberships?.filter(
    (membership) =>
      membership?.contract?.type === "freelance" &&
      membership.status === "active"
  );

  return (
    <div className="Timetable">
      <div className="Timetable-header">
        <div className="Timetable-header-title">
          <Title level={1}>Workers</Title>
        </div>
      </div>
      <div id="Workers-list">
        {staff && (
          <>
            <Title level={2}>Core team</Title>
            {staff.map((membership) => (
              <WorkerRow
                key={membership.id}
                membership={membership}
              ></WorkerRow>
            ))}
          </>
        )}
        {freelancers && freelancers.length > 0 && (
          <>
            <Title level={2}>Freelancers</Title>
            {freelancers.map((membership) => (
              <WorkerRow
                key={membership.id}
                membership={membership}
              ></WorkerRow>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
