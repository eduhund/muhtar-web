import React, { useMemo, useState } from "react";
import {
  Table,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useProjects } from "../../hooks/useProjects";
import { useMemberships } from "../../hooks/useMemberships";
import { useBookedResources } from "../../hooks/useBookedResources";
import { formatDuration } from "../Timeline/utils";
import { DeleteOutlined } from "@ant-design/icons";

dayjs.extend(isoWeek);

const { Text } = Typography;

export default function ResourcePlanner() {
  const { activeProjects = [] } = useProjects();
  const { memberships = [] } = useMemberships();
  const {
    bookedResources = [],
    bookResource,
    rebookResource,
    unbookResource,
  } = useBookedResources();

  const [week, setWeek] = useState<Dayjs>(dayjs().startOf("isoWeek"));

  const weekDates = useMemo(() => {
    const start = week.startOf("isoWeek");
    return new Array(7)
      .fill(0)
      .map((_, i) => start.add(i, "day").format("YYYY-MM-DD"));
  }, [week]);

  // Helpers to be resilient to small shape differences in booked resource objects
  const getMembershipIdFromEntry = (e: any) =>
    e.resource?.id || e.target?.id || null;
  const getTimeValueFromEntry = (e: any) => {
    if (!e) return 0;
    if (e.resource && typeof e.resource.value === "number")
      return e.resource.value;
    if (e.target && typeof e.target.value === "number") return e.target.value;
    if (typeof e.value === "number") return e.value;
    return 0;
  };

  // Aggregations
  const weeklySums = useMemo(() => {
    const map: { [key: string]: { [key: string]: number } } = {};
    // initialize
    memberships.forEach((m) => {
      map[m.id] = {};
      activeProjects.forEach((p) => (map[m.id][p.id] = 0));
    });

    bookedResources.forEach((entry: any) => {
      if (!entry || entry.isDeleted) return;
      if (!weekDates.includes(entry.date)) return;
      const membershipId = getMembershipIdFromEntry(entry);
      if (!membershipId) return;
      const projectId = entry.projectId;
      const value = getTimeValueFromEntry(entry) || 0;
      if (map[membershipId] && map[membershipId][projectId] !== undefined) {
        map[membershipId][projectId] += value;
      }
    });
    return map;
  }, [bookedResources, memberships, activeProjects, weekDates]);

  // Find single-day entry for exact selected date (week start) per membership+project
  const entryFor = (projectId: string, membershipId: string, date: string) =>
    bookedResources.find(
      (e: any) =>
        !e.isDeleted &&
        e.projectId === projectId &&
        e.date === date &&
        getMembershipIdFromEntry(e) === membershipId,
    );

  // Table columns
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        title: "Person",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        width: 200,
      },
    ];

    activeProjects.forEach((project) => {
      cols.push({
        title: project.name,
        dataIndex: project.id,
        key: project.id,
        width: 200,
        render: (_: any, record: any) => {
          const membershipId = record.key;
          const weeklyTotal = weeklySums[membershipId]?.[project.id] || 0;
          const selectedDate = week.format("YYYY-MM-DD");
          const entry = entryFor(project.id, membershipId, selectedDate);
          const dayValue = getTimeValueFromEntry(entry);
          return (
            <div
              style={{
                width: 80,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <InputNumber
                width={50}
                variant="borderless"
                controls={false}
                min={0}
                step={1}
                precision={0}
                value={dayValue ? dayValue / 60 : 0}
                onChange={async (val) => {
                  const newHours = val || 0; // hours (decimal)
                  const newMinutes = Math.round(newHours * 60);
                  if (entry && entry.id) {
                    if (newMinutes === 0) {
                      await unbookResource({ id: entry.id });
                    } else if (newMinutes !== getTimeValueFromEntry(entry)) {
                      await rebookResource({
                        id: entry.id,
                        value: newMinutes,
                      });
                    }
                  } else {
                    if (newMinutes > 0) {
                      await bookResource({
                        projectId: project.id,
                        date: selectedDate,
                        type: "time",
                        resource: { type: "time", value: newMinutes },
                        target: { type: "worker", id: membershipId },
                      });
                    }
                  }
                }}
              />
              {entry && (
                <Button
                  size="small"
                  type="text"
                  onClick={async () =>
                    entry.id && (await unbookResource({ id: entry.id }))
                  }
                >
                  <DeleteOutlined />
                </Button>
              )}
            </div>
          );
        },
      });
    });

    // Last column - row total
    cols.push({
      title: "Total",
      dataIndex: "__rowTotal__",
      key: "__rowTotal__",
      fixed: "right",
      width: 120,
      render: (_: any, record: any) => {
        const membershipId = record.key;
        const total = activeProjects.reduce(
          (acc, p) => acc + (weeklySums[membershipId]?.[p.id] || 0),
          0,
        );
        return <Text strong>{formatDuration(total)}</Text>;
      },
    });

    return cols;
  }, [activeProjects, weeklySums, week]);

  // Table data (rows per membership plus totals row)
  const dataSource = useMemo(() => {
    const rows = memberships
      ?.filter((m) => m.status === "active")
      .map((m: any) => ({ key: m.id, name: m.name }));
    // totals row
    const totalRow: any = { key: "__totals__", name: "Total" };
    activeProjects.forEach((p) => {
      const sum = memberships
        ?.filter((m) => m.status === "active")
        .reduce(
          (acc: number, m: any) => acc + (weeklySums[m.id]?.[p.id] || 0),
          0,
        );
      totalRow[p.id] = sum;
    });
    rows.push(totalRow);
    return rows;
  }, [memberships, activeProjects, weeklySums]);

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <DatePicker
          picker="week"
          value={week}
          onChange={(d) => d && setWeek(d.startOf("isoWeek"))}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey={(r) => r.key}
        bordered
        size="small"
      />
    </div>
  );
}
