import { useMemo, useState, useCallback, useRef } from "react";
import {
  Table,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Typography,
} from "antd";
import enGB from "antd/es/date-picker/locale/en_GB";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/en-gb";
import { useProjects } from "../../hooks/useProjects";
import { useMemberships } from "../../hooks/useMemberships";
import { useBookedResources } from "../../hooks/useBookedResources";
import { formatDuration } from "../Timeline/utils";
import { DeleteOutlined } from "@ant-design/icons";
import Title from "antd/lib/typography/Title";

dayjs.extend(isoWeek);
dayjs.locale("en-gb");

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
          const selectedDate = week.startOf("isoWeek").format("YYYY-MM-DD");
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

  // Table data (rows per membership only, totals moved to summary)
  const dataSource = useMemo(() => {
    const rows =
      memberships
        ?.filter((m) => m.status === "active")
        .map((m: any) => ({ key: m.id, name: m.name })) || [];
    return rows;
  }, [memberships]);

  return (
    <>
      <Space
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Planner
        </Title>
        <DatePicker
          picker="week"
          value={week}
          locale={enGB}
          onChange={(d) => d && setWeek(d)}
          format={(value) => {
            const weekNum = value.isoWeek();
            const start = value.startOf("isoWeek");
            const end = value.endOf("isoWeek");
            return `W${weekNum} (${start.format("MMM D")} – ${end.format("MMM D")})`;
          }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey={(r) => r.key}
        bordered
        size="small"
        scroll={{ x: true, y: 400 }}
        summary={() => (
          <Table.Summary fixed="bottom">
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <Text strong>Total</Text>
              </Table.Summary.Cell>
              {activeProjects.map((project, idx) => {
                const sum = memberships
                  ?.filter((m) => m.status === "active")
                  .reduce(
                    (acc: number, m: any) =>
                      acc + (weeklySums[m.id]?.[project.id] || 0),
                    0,
                  );
                return (
                  <Table.Summary.Cell key={project.id} index={idx + 1}>
                    <Text strong>{formatDuration(sum || 0)}</Text>
                  </Table.Summary.Cell>
                );
              })}
              <Table.Summary.Cell index={activeProjects.length + 1}>
                <Text strong>
                  {formatDuration(
                    memberships
                      ?.filter((m) => m.status === "active")
                      .reduce((total: number, m: any) => {
                        const memberTotal = activeProjects.reduce(
                          (acc, p) => acc + (weeklySums[m.id]?.[p.id] || 0),
                          0,
                        );
                        return total + memberTotal;
                      }, 0) || 0,
                  )}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </>
  );
}
