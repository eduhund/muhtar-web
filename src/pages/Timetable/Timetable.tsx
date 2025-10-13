import { Table, Typography } from "antd";

import { columns } from "./components/columns";
import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";

import "./Timetable.scss";
import { Filters } from "./components/Filters";
import { useState } from "react";

const { Title } = Typography;

export function Timetable() {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const { timetable, isLoading } = useTimetable();
  console.log(timetable, filters);

  const filteredTimetable = timetable?.filter((entry) => {
    return Object.entries(filters).every(([key, value]) => {
      console.log(entry, key, value);
      if (!value) return true;
      if (key === "date") {
        return entry.date === value;
      } else if (key === "memberships") {
        return value.includes(entry.membership?.id);
      } else if (key === "projects") {
        return value.includes(entry.project?.id);
      }
      return true;
    });
  });

  const { rowSelection, onRowClick } = useSelect(timetable);

  return (
    <div className="Timetable">
      <div className="Timetable-header">
        <div className="Timetable-header-title">
          <Title level={1}>Timetable</Title>
        </div>
        {timetable?.length && (
          <Filters data={timetable} filters={filters} setFilters={setFilters} />
        )}
      </div>
      <div id="timetable">
        <Table
          className="timetable"
          sticky={true}
          pagination={{
            showSizeChanger: false,
            pageSize: 200,
          }}
          dataSource={filteredTimetable || []}
          columns={columns}
          rowSelection={rowSelection}
          onRow={onRowClick}
          size="small"
          loading={isLoading}
        />
      </div>
    </div>
  );
}
