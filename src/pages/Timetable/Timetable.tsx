import { Table } from "antd";

import { columns } from "./components/columns";
import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";

import "./Timetable.scss";
import { Filters } from "./components/Filters";
import { useTimetableFilters } from "../../hooks/useTimetableFilters";
import { TimetableItem } from "../../context/AppContext";
import { TotalHint } from "./TotalHint";
import Page from "../../components/Page/Page";

export function Timetable() {
  const { timetable, isLoading } = useTimetable();
  const timetableFilters = useTimetableFilters(timetable || []);

  const { rowSelection, onRowClick } = useSelect(timetable);

  return (
    <Page
      className="Timetable"
      title="Timetable"
      actions={<Filters timetableFilters={timetableFilters} />}
    >
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
