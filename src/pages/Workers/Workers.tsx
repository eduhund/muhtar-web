import { Checkbox, Select, Typography } from "antd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemberships } from "../../hooks/useMemberships";
import { Membership, Resource } from "../../context/AppContext";
import { useResources } from "../../hooks/useResources";
import { useMembership } from "../../hooks/useMembership";
import { Navigate } from "react-router-dom";

import "./Workers.scss";
//import { useProjects } from "../../hooks/useProjects";
import Page from "../../components/Page/Page";
import SideList from "../../components/SideList/SideList";
import { useState } from "react";
import QuickSummaryItem from "./components/QuickSummaryItem/QuickSummaryItem";
import WorkerPage from "./WorkerPage";
import { ResourcesPlanner } from "../../components/ResourcesPlanner/ResourcesPlanner";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title, Paragraph } = Typography;

type Period = "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

// Test data
const testData = [
  {
    id: "phase1",
    name: "Acme Corporation",
    tasks: ["task2"],
    roles: ["designer", "analyst"],
    status: "completed",
    children: [
      {
        id: "job2",
        name: "Design Documentation",
        startDate: "2024-01-06",
        dueDate: "2024-01-12",
        status: "completed",
        roles: [
          {
            key: "designer",
            resources: [
              { type: "time", value: 3600 }, // 60 hours
              { type: "budget", value: 6600 },
            ],
          },
          {
            key: "analyst",
            resources: [
              { type: "time", value: 1800 }, // 30 hours
              { type: "budget", value: 3000 },
            ],
          },
        ],
        assignments: [
          { worker: "Emily Davis", role: "designer" },
          { worker: "Sarah Johnson", role: "analyst" },
        ],
        // Actual data: finished earlier with fewer hours (ahead of schedule)
        actualStartDate: "2024-01-06",
        actualDueDate: "2024-01-10",
        actualRoles: [
          {
            key: "designer",
            resources: [
              { type: "time", value: 3300 }, // 55 hours (under budget)
              { type: "budget", value: 6050 },
            ],
          },
          {
            key: "analyst",
            resources: [
              { type: "time", value: 1500 }, // 25 hours (under budget)
              { type: "budget", value: 2500 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "phase2",
    name: "TechStart Inc",
    tasks: ["task3", "task4"],
    roles: ["backend-dev", "qa"],
    status: "inProgress",
    children: [
      {
        id: "job3",
        name: "Backend Development",
        startDate: "2024-01-13",
        dueDate: "2024-01-20",
        status: "completed",
        roles: [
          {
            key: "backend-dev",
            resources: [
              { type: "time", value: 4800 }, // 80 hours
              { type: "budget", value: 9600 },
            ],
          },
        ],
        assignments: [{ worker: "Alex Rodriguez", role: "backend-dev" }],
        // Actual data: started on time, finished late (delayed)
        actualStartDate: "2024-01-13",
        actualDueDate: "2024-01-23",
        actualRoles: [
          {
            key: "backend-dev",
            resources: [
              { type: "time", value: 7800 }, // 130 hours (50 hours overrun)
              { type: "budget", value: 15600 },
            ],
          },
        ],
      },
      {
        id: "job6",
        name: "Testing",
        startDate: "2024-01-28",
        dueDate: "2024-02-03",
        status: "inProgress",
        roles: [
          {
            key: "qa",
            resources: [
              { type: "time", value: 3600 }, // 60 hours
              { type: "budget", value: 5400 },
            ],
          },
          {
            key: "backend-dev",
            resources: [
              { type: "time", value: 1200 }, // 20 hours
              { type: "budget", value: 2400 },
            ],
          },
        ],
        assignments: [
          { worker: "Tom Zhang", role: "qa" },
          { worker: "David Kim", role: "backend-dev" },
        ],
      },
    ],
  },
  {
    id: "phase3",
    name: "Global Solutions Ltd",
    tasks: ["task5"],
    roles: ["fullstack-dev"],
    status: "backlog",
    children: [
      {
        id: "job7",
        name: "Production Deploy",
        startDate: "2024-02-04",
        dueDate: "2024-02-06",
        status: "backlog",
        roles: [
          {
            key: "fullstack-dev",
            resources: [
              { type: "time", value: 1200 }, // 20 hours
              { type: "budget", value: 2400 },
            ],
          },
        ],
        assignments: [{ worker: "Lisa Wang", role: "fullstack-dev" }],
      },
    ],
  },
];

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

function WorkerRow({
  membership,
  isSelected,
  onClick,
}: {
  membership: Membership;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { resources } = useResources();

  const membershipEntries =
    resources?.filter((item) => item.membership.id === membership.id) || [];

  const thisWeekEntries = filterByPeriod(membershipEntries, "thisWeek");
  const thisMonthEntries = filterByPeriod(membershipEntries, "thisMonth");
  const totalWeekDuration =
    thisWeekEntries.reduce((acc, item) => acc + item.consumed, 0) / 60; // in hours
  const totalMonthDuration =
    thisMonthEntries.reduce((acc, item) => acc + item.consumed, 0) / 60; // in hours

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
  const [contractType, setContractType] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  function handleShowActiveOnlyChange(e: any) {
    setShowActiveOnly(e.target.checked);
  }

  function handleContractTypeChange(value: string) {
    setContractType(value);
  }

  const { membership } = useMembership();
  const { memberships } = useMemberships();

  if (membership?.accessRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  const filteredMemberships = memberships?.filter((m) => {
    const lastContract =
      m.contract && m.contract.length > 0
        ? m.contract[m.contract.length - 1]
        : null;
    let contractMatch = true;
    if (contractType === "staff") {
      contractMatch = !!lastContract && lastContract.type === "staff";
    } else if (contractType === "freelance") {
      contractMatch = !!lastContract && lastContract.type === "freelance";
    }

    let statusMatch = true;
    if (showActiveOnly) {
      statusMatch = m.status === "active";
    }

    return contractMatch && statusMatch;
  });

  const sortedMemberships = filteredMemberships?.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <Page title="Workers">
      <div className="Workers">
        <SideList>
          <div className="Workers-filters">
            <Select
              defaultValue="all"
              options={[
                { value: "all", label: "All" },
                { value: "staff", label: "Staff only" },
                { value: "freelance", label: "Freelancers only" },
              ]}
              onChange={handleContractTypeChange}
            />
            <Checkbox onChange={handleShowActiveOnlyChange}>
              Show active only
            </Checkbox>
          </div>
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
              <ResourcesPlanner data={testData} />
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
