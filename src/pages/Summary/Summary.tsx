import { Table } from "antd";

import { columns } from "../../components/columns";

import { Filters } from "../../components/Filters";
import { TotalHint } from "./TotalHint";
import { useFilters } from "../../hooks/useFilters";
import { useSelect } from "../../hooks/useSelect";
import { useTime } from "../../hooks/useTime";

import "./Summary.css";
import { ProjectBudget, UserBudget } from "../../components/Statistics";
import { useMemo } from "react";

export function Summary() {
  const { data, isLoading } = useTime();

  const { filters, setFilters, resetFilters, filteredData } = useFilters(data);
  const { rowSelection, onRowClick } = useSelect(filteredData);
  const isSingleProject = useMemo(
    () => filters?.projectName?.length === 1 && !filters?.userName?.length,
    [filters]
  );
  const isSingleUser = useMemo(
    () => filters?.userName?.length === 1 && !filters?.projectName?.length,
    [filters]
  );

  return (
    <div className="container">
      <div className="sidebar">
        <Filters
          data={data}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
        />
        {isSingleProject && <ProjectBudget data={filteredData} />}
        {isSingleUser && <UserBudget data={filteredData} />}
      </div>
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

      <TotalHint
        data={data}
        filteredData={filteredData}
        filters={filters}
        selection={rowSelection}
      />
    </div>
  );
}
