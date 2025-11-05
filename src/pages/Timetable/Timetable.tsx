import { useState } from "react";
import { Button, Table, type TableProps } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";

import { Filters } from "./components/Filters";
import { useTimetableFilters } from "../../hooks/useTimetableFilters";
import { TimetableItem } from "../../context/AppContext";
import { TotalHint } from "./TotalHint";
import Page from "../../components/Page/Page";

import TimeEditModal from "./components/TimeEditModal";
import "./Timetable.scss";

interface DataType {
  key: string;
  id: string;
  date: Date;
  ts: number;
  membership: { id: string; name: string };
  project: { id: string; name: string; customer: string | null };
  duration: number;
  comment: string;
}

export function Timetable() {
  const [editingEntry, setEditingEntry] = useState<DataType | null>(null);
  const { timetable, isLoading } = useTimetable();
  const timetableFilters = useTimetableFilters(timetable || []);

  const { rowSelection, onRowClick } = useSelect(timetable);

  function handleEntryEdit(record: DataType) {
    setEditingEntry(record);
  }

  function handleEntryDelete(record: DataType) {
    console.log("Delete entry", record.id);
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEntryEdit(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEntryDelete(record);
            }}
          />
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
