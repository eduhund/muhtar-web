import { useState } from "react";
import { Button, message, Table, type TableProps } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";

import { Filters } from "./components/Filters";
import { useTimetableFilters } from "../../hooks/useTimetableFilters";
import { TimetableItem } from "../../context/AppContext";
import { TotalHint } from "./TotalHint";
import Page from "../../components/Page/Page";

import TimeEditModal from "./components/TimeEditModal";
import "./Timetable.scss";
import { useMembership } from "../../hooks/useMembership";

interface DataType {
  key: string;
  id: string;
  date: Date;
  ts: number;
  membership: { id: string; name: string };
  project: { id: string; name: string; customer: string | null };
  duration: number;
  comment: string;
  isDeleted: boolean;
}

export function Timetable() {
  const [editingEntry, setEditingEntry] = useState<DataType | null>(null);
  const { timetable, isLoading, deleteTime, restoreTime } = useTimetable();
  const { membership } = useMembership();
  const timetableFilters = useTimetableFilters(timetable || []);
  const [messageApi, contextHolder] = message.useMessage();

  const { rowSelection, onRowClick } = useSelect(timetable);

  const showSuccessMessage = (action: "delete" | "restore") => {
    messageApi.open({
      type: "success",
      content: `Entry ${action}d successfully!`,
    });
  };

  const showErrorMessage = (action: "delete" | "restore") => {
    messageApi.open({
      type: "error",
      content: `Entry was not ${action}d!`,
    });
  };

  function handleEntryEdit(record: DataType) {
    setEditingEntry(record);
  }

  async function handleEntryDelete(record: DataType) {
    const OK = await deleteTime({ id: record.id });
    if (OK) {
      showSuccessMessage("delete");
    } else {
      showErrorMessage("delete");
    }
  }

  async function handleEntryRestore(record: DataType) {
    const OK = await restoreTime({ id: record.id });
    if (OK) {
      showSuccessMessage("restore");
    } else {
      showErrorMessage("restore");
    }
  }

  const columns: TableProps<DataType>["columns"] = [
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
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 88,
      render: (_: any, record) => (
        <>
          {record.membership.id === membership?.id && (
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

  return (
    <Page
      className="Timetable"
      title="Timetable"
      actions={<Filters timetableFilters={timetableFilters} />}
    >
      {contextHolder}
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
