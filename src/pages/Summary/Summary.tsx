import { Table } from "antd";

import { columns } from "../../components/columns";

import { useSelect } from "../../hooks/useSelect";

import "./Summary.css";
import { useTimetable } from "../../hooks/useTimetable";

export function Summary() {
  const { timetable, isLoading } = useTimetable();

  const { rowSelection, onRowClick } = useSelect(timetable);

  return (
    <div className="container">
      <div id="timetable">
        <Table
          className="timetable"
          sticky={true}
          pagination={{
            showSizeChanger: false,
            pageSize: 200,
          }}
          dataSource={timetable || []}
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
