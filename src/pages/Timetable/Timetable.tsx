import { useMemo, useState } from "react";
import { Button, Table, Tag, type TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { TimetableItem } from "../../context/AppContext";
import { useMembership } from "../../hooks/useMembership";
import { useProjects } from "../../hooks/useProjects";
import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";
import { useTimetableFilters } from "../../hooks/useTimetableFilters";
import { useUIMessages } from "../../providers/UIMessageProvider";

import Filters from "./components/Filters";
import Page from "../../components/Page/Page";
import TimeEditModal from "./components/TimeEditModal";
import TotalHint from "./components/TotalHint";

import "./Timetable.scss";

interface DataType {
  key: string;
  id: string;
  date: Date;
  ts: number;
  membership: { id: string; name: string };
  project: { id: string; name: string; customer: string | null };
  task: { id: string; name: string } | null;
  duration: number;
  comment: string;
  isDeleted: boolean;
}

export function Timetable() {
  const [editingEntry, setEditingEntry] = useState<DataType | null>(null);
  const { timetable, isLoading, deleteTime, restoreTime } = useTimetable();
  const { projects } = useProjects();
  const { membership } = useMembership();
  const timetableFilters = useTimetableFilters(timetable || []);
  const UIMessages = useUIMessages();

  const { rowSelection, onRowClick } = useSelect(timetable);

  const isAdmin = membership?.accessRole === "admin";

  function handleEntryEdit(record: DataType) {
    setEditingEntry(record);
  }

  const columns: TableProps<DataType>["columns"] = useMemo(() => {
    function getProjectRole(projectId: string, membershipId?: string) {
      const project = projects?.find((p) => p.id === projectId);
      if (!project) return null;
      const membership = project.memberships.find(
        (m) => m.membershipId === membershipId
      );
      return membership ? membership.accessRole : null;
    }

    async function handleEntryDelete(record: DataType) {
      const OK = await deleteTime({ id: record.id });
      if (OK) {
        UIMessages.deleteTime.success();
      } else {
        UIMessages.deleteTime.error();
      }
    }

    async function handleEntryRestore(record: DataType) {
      const OK = await restoreTime({ id: record.id });
      if (OK) {
        UIMessages.restoreTime.success();
      } else {
        UIMessages.restoreTime.error();
      }
    }

    return [
      {
        title: "When",
        dataIndex: "date",
        key: "date",
        width: 160,
        render: (date: Date) => {
          const dateObj = new Date(date);

          const dateString = dateObj.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const dayOfWeek = dateObj.toLocaleDateString("ru-RU", {
            weekday: "long",
          });

          return (
            <>
              <div>{dateString}</div>
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>{dayOfWeek}</span>
            </>
          );
        },
      },
      {
        title: "Who",
        dataIndex: "membershipName",
        key: "membershipName",
        width: 180,
        render: (_: unknown, { membership }: DataType) => membership.name,
      },
      {
        title: "Where",
        dataIndex: "projectName",
        key: "projectName",
        width: 200,
        render: (_: unknown, { project }: DataType) => (
          <>
            {project.customer && (
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                {project.customer}
              </span>
            )}
            <div>{project.name}</div>
          </>
        ),
      },
      {
        title: "How long",
        dataIndex: "duration",
        key: "duration",
        width: 80,
        render: (duration: number) => String(duration / 60).replace(".", ","),
      },
      {
        title: "What",
        dataIndex: "comment",
        key: "comment",
        render: (_: unknown, { task, comment }: DataType) => (
          <div>
            {task && (
              <Tag color="orange" style={{ marginBottom: 4 }}>
                {task.name}
              </Tag>
            )}
            <div>{comment}</div>
          </div>
        ),
      },
      {
        title: "",
        key: "actions",
        fixed: "right",
        width: 88,
        render: (_: unknown, record) => (
          <>
            {(isAdmin ||
              getProjectRole(record.project.id, membership?.id) === "admin" ||
              record.membership.id === membership?.id) && (
              <>
                {!record.isDeleted && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryEdit(record);
                    }}
                  />
                )}
                {record.isDeleted ? (
                  <Button
                    type="text"
                    icon={<RollbackOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryRestore(record);
                    }}
                  />
                ) : (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEntryDelete(record);
                    }}
                  />
                )}
              </>
            )}
          </>
        ),
      },
    ];
  }, [
    UIMessages.deleteTime,
    UIMessages.restoreTime,
    deleteTime,
    isAdmin,
    membership?.id,
    projects,
    restoreTime,
  ]);

  return (
    <Page
      className="Timetable"
      title="Timetable"
      actions={<Filters timetableFilters={timetableFilters} />}
    >
      <TimeEditModal
        record={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
      <Table
        className="timetable"
        sticky={true}
        pagination={{
          showSizeChanger: false,
          pageSize: 200,
        }}
        dataSource={(timetableFilters.filteredList || []).map(
          (item: TimetableItem) => {
            return { key: item.id, ...item };
          }
        )}
        columns={columns}
        rowSelection={rowSelection}
        rowClassName={(record) =>
          record.isDeleted ? "Timetable-row-deleted" : ""
        }
        onRow={onRowClick}
        size="small"
        loading={isLoading}
      />
      <TotalHint
        data={timetable || []}
        filteredData={timetableFilters.filteredList || []}
        filters={timetableFilters.filters || {}}
        selection={rowSelection}
      />
    </Page>
  );
}
