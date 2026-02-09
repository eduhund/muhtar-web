import { useMemo, useState, useCallback, useRef } from "react";
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
    updateBookedResource,
    resetBookedResource,
  } = useBookedResources();

  const [week, setWeek] = useState<Dayjs>(dayjs().startOf("isoWeek"));

  // Local state for input values (before committing to API)
  // null represents empty field (user cleared it)
  const [localValues, setLocalValues] = useState<{
    [key: string]: number | null;
  }>({});

  // Track pending operations to prevent duplicate requests
  const pendingOperations = useRef<Set<string>>(new Set());

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
    memberships?.forEach((m) => {
      map[m.id] = {};
      activeProjects.forEach((p) => (map[m.id][p.id] = 0));
    });

    bookedResources?.forEach((entry: any) => {
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
  const entryFor = useCallback(
    (projectId: string, membershipId: string, date: string) =>
      bookedResources?.find(
        (e: any) =>
          !e.isDeleted &&
          e.projectId === projectId &&
          e.date === date &&
          getMembershipIdFromEntry(e) === membershipId,
      ),
    [bookedResources],
  );

  // Stable handlers with duplicate request prevention
  const handleCommitValue = useCallback(
    async (
      projectId: string,
      membershipId: string,
      date: string,
      newMinutes: number,
      entry: any,
    ) => {
      const operationKey = `${projectId}-${membershipId}-${date}`;

      // Clear local value since we're committing
      setLocalValues((prev) => {
        const next = { ...prev };
        delete next[operationKey];
        return next;
      });

      // Prevent duplicate requests
      if (pendingOperations.current.has(operationKey)) {
        return;
      }

      pendingOperations.current.add(operationKey);

      try {
        if (entry && entry.id) {
          // Update or delete existing entry
          if (newMinutes === 0) {
            await resetBookedResource({ id: entry.id });
          } else if (newMinutes !== getTimeValueFromEntry(entry)) {
            await updateBookedResource({
              id: entry.id,
              value: newMinutes,
            });
          }
        } else {
          // Create new entry
          if (newMinutes > 0) {
            await bookResource({
              projectId,
              date,
              period: "week",
              resource: { type: "time", value: newMinutes },
              target: { type: "worker", id: membershipId },
            });
          }
        }
      } finally {
        pendingOperations.current.delete(operationKey);
      }
    },
    [bookResource, updateBookedResource, resetBookedResource],
  );

  const handleLocalChange = useCallback(
    (
      projectId: string,
      membershipId: string,
      date: string,
      newHours: number | null,
    ) => {
      const operationKey = `${projectId}-${membershipId}-${date}`;
      setLocalValues((prev) => ({
        ...prev,
        [operationKey]: newHours,
      }));
    },
    [],
  );

  const handleDeleteEntry = useCallback(
    async (entryId: string, operationKey: string) => {
      // Prevent duplicate requests
      if (pendingOperations.current.has(operationKey)) {
        return;
      }

      pendingOperations.current.add(operationKey);

      try {
        await resetBookedResource({ id: entryId });
      } finally {
        pendingOperations.current.delete(operationKey);
      }
    },
    [resetBookedResource],
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
        width: 100,
        render: (_: any, record: any) => {
          const membershipId = record.key;

          // Special handling for totals row
          if (membershipId === "__totals__") {
            const totalValue = record[project.id] || 0;
            return <Text strong>{formatDuration(totalValue)}</Text>;
          }

          const selectedDate = week.format("YYYY-MM-DD");
          const entry = entryFor(project.id, membershipId, selectedDate);
          const dayValue = getTimeValueFromEntry(entry);
          const operationKey = `${project.id}-${membershipId}-${selectedDate}`;

          // Use local value if exists, otherwise use server value
          // Show empty field (undefined) when there's no value
          const displayValue =
            operationKey in localValues
              ? localValues[operationKey]
              : dayValue
                ? dayValue / 60
                : undefined;

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
                value={displayValue}
                onChange={(val) => {
                  // Allow null/undefined for empty field, otherwise use the value
                  const newHours = val ?? null;
                  handleLocalChange(
                    project.id,
                    membershipId,
                    selectedDate,
                    newHours,
                  );
                }}
                onBlur={() => {
                  const currentValue = localValues[operationKey];
                  if (currentValue !== undefined) {
                    const newMinutes = Math.round((currentValue ?? 0) * 60);
                    handleCommitValue(
                      project.id,
                      membershipId,
                      selectedDate,
                      newMinutes,
                      entry,
                    );
                  }
                }}
                onPressEnter={(e) => {
                  const currentValue = localValues[operationKey];
                  if (currentValue !== undefined) {
                    const newMinutes = Math.round((currentValue ?? 0) * 60);
                    handleCommitValue(
                      project.id,
                      membershipId,
                      selectedDate,
                      newMinutes,
                      entry,
                    );
                  }
                  // Blur the input to remove focus
                  (e.target as HTMLInputElement).blur();
                }}
              />
              {entry && (
                <Button
                  size="small"
                  type="text"
                  onClick={() => {
                    if (entry.id) {
                      handleDeleteEntry(entry.id, operationKey);
                    }
                  }}
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
      width: 100,
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
  }, [
    activeProjects,
    weeklySums,
    week,
    localValues,
    handleLocalChange,
    handleCommitValue,
    handleDeleteEntry,
    entryFor,
  ]);

  // Table data (rows per membership plus totals row)
  const dataSource = useMemo(() => {
    const rows =
      memberships
        ?.filter((m) => m.status === "active")
        .map((m: any) => ({ key: m.id, name: m.name })) || [];
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
    <>
      <Space style={{ marginBottom: 12 }}>
        <DatePicker
          picker="week"
          value={week}
          onChange={(d) => d && setWeek(d)}
        />
      </Space>
      <Table
        style={{ overflow: "auto" }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey={(r) => r.key}
        bordered
        size="small"
        sticky
      />
    </>
  );
}
