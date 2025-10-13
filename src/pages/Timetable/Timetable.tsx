import { Table, Typography } from "antd";

import { columns } from "./components/columns";
import { useSelect } from "../../hooks/useSelect";
import { useTimetable } from "../../hooks/useTimetable";

import "./Timetable.scss";
import { Filters } from "./components/Filters";
import { useTimetableFilters } from "../../hooks/useTimetableFilters";
import { TimetableItem } from "../../context/TimetableContext";

const { Title } = Typography;

export function Timetable() {
  const { timetable, isLoading } = useTimetable();
  const timetableFilters = useTimetableFilters(timetable || []);

  const { rowSelection, onRowClick } = useSelect(timetable);

  return (
    <div className="Timetable">
      <div className="Timetable-header">
        <div className="Timetable-header-title">
          <Title level={1}>Timetable</Title>
        </div>
        {timetable?.length && <Filters timetableFilters={timetableFilters} />}
      </div>
      <div id="timetable">
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
      </div>
    </div>
  );
}
