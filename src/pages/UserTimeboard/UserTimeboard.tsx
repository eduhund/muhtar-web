import { useParams } from "react-router-dom";

import { Table } from "antd";

import { columns } from "../../components/columns";

import { Filters } from "../../components/Filters";
import { useFilters } from "../../hooks/useFilters";
import { useSelect } from "../../hooks/useSelect";
import { useTime } from "../../hooks/useTime";

export function UserTimeboard() {
  const { userId } = useParams();

  const { data, isLoading } = useTime();
  const { filters, setFilters, resetFilters, filteredData } = useFilters(data, {
    userId,
  });
  const { rowSelection, onRowClick } = useSelect(filteredData);

  return (
    <div className="container">
      <Filters
        data={data}
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        scope={["date", "project"]}
      />
      <div id="timetable">
        <Table
          className="timetable"
          sticky={true}
          pagination={{
            showSizeChanger: false,
            pageSize: 200,
          }}
          dataSource={filteredData}
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
