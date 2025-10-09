import { Table } from "antd";

import { columns } from "../../components/columns";

import { TotalHint } from "./TotalHint";
import { useSelect } from "../../hooks/useSelect";

import "./Summary.css";
import { useEffect, useState } from "react";
import { useMembership } from "../../hooks/useMembership";

export function Summary() {
  const [timeList, setTimeList] = useState<any>([]);

  const { getTime, isLoading } = useMembership();

  useEffect(() => {
    getTime({ from: "2025-10-01", to: "2025-10-09" }).then(({ data = [] }) => {
      setTimeList(data);
    });
  }, []);

  const { rowSelection, onRowClick } = useSelect(timeList);

  return (
    <div className="container">
      <div className="sidebar"></div>
      <div id="timetable">
        <Table
          className="timetable"
          sticky={true}
          pagination={{
            showSizeChanger: false,
            pageSize: 200,
          }}
          dataSource={timeList}
          columns={columns}
          rowSelection={rowSelection}
          onRow={onRowClick}
          size="small"
          loading={isLoading}
        />
      </div>

      <TotalHint
        data={timeList}
        filteredData={timeList}
        filters={{}}
        selection={rowSelection}
      />
    </div>
  );
}
