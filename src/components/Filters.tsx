import { useMemo } from "react";

import { DatePicker, Select, Button } from "antd";

import { defaultListSort } from "../utils/helpers";

const { RangePicker } = DatePicker;

function DateFilter({ filters, onChange }: any) {
  function handleChange(date: any) {
    onChange("date", date);
  }

  const dateFormat = "DD MMMM YYYY";

  return (
    <RangePicker
      placeholder={["Начало периода", "Конец периода"]}
      value={filters["date"] || []}
      format={dateFormat}
      style={{ width: "320px" }}
      onChange={handleChange}
    />
  );
}

function EmployeeFilter({ data, filters, onChange }: any) {
  const userList = useMemo(() => {
    return data.reduce((acc: any, item: any) => {
      if (!acc.some((obj: any) => obj.value === item.userName)) {
        acc.push({ value: item.userName });
      }
      return acc;
    }, []);
  }, [data]);

  function handleChange(value: any) {
    onChange("userName", value);
  }

  return (
    <Select
      placeholder="Все"
      options={userList}
      value={filters["userName"] || null}
      optionFilterProp="value"
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Сотрудники"
      style={{ width: "320px" }}
      onChange={handleChange}
    />
  );
}

function ProjectFilter({ data, filters, onChange }: any) {
  const projectList = useMemo(() => {
    return data.reduce((acc: any, item: any) => {
      if (!acc.some((obj: any) => obj.value === item.projectName)) {
        acc.push({ value: item.projectName });
      }
      return acc;
    }, []);
  }, [data]);

  function handleChange(value: any) {
    onChange("projectName", value);
  }

  return (
    <Select
      placeholder="Все"
      options={projectList}
      value={filters["projectName"] || null}
      optionFilterProp="value"
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Проекты"
      style={{ width: "320px" }}
      onChange={handleChange}
    />
  );
}

export function Filters({
  data,
  filters,
  setFilters,
  resetFilters,
  scope = null,
}: any) {
  const handleChange = (column: any, value: any) => {
    setFilters((prevFilters: any) => {
      if (value && value.length > 0) return { ...prevFilters, [column]: value };
      else {
        const { [column]: _, ...rest } = prevFilters;
        return rest;
      }
    });
  };

  return (
    <div id="timetable_filters">
      {(!scope || scope.includes("date")) && (
        <DateFilter filters={filters} onChange={handleChange} />
      )}
      {(!scope || scope.includes("user")) && (
        <EmployeeFilter data={data} filters={filters} onChange={handleChange} />
      )}
      {(!scope || scope.includes("project")) && (
        <ProjectFilter data={data} filters={filters} onChange={handleChange} />
      )}
      <Button
        type="link"
        disabled={Object.keys(filters).length === 0}
        onClick={resetFilters}
      >
        Сбросить фильтры
      </Button>
    </div>
  );
}
