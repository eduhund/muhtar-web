import { useMemo } from "react";

import { DatePicker, Select, Button } from "antd";

import { defaultListSort } from "../../../utils/helpers";

const { RangePicker } = DatePicker;

function DateFilter({ timetableFilters }: any) {
  const { filters, setFilter } = timetableFilters;
  function handleChange(date: any) {
    setFilter("date", date);
  }

  const dateFormat = "DD MMMM YYYY";
  const value = filters ? filters["date"] || [] : null;

  return (
    <RangePicker
      placeholder={["From", "To"]}
      value={value}
      format={dateFormat}
      style={{ width: "280px" }}
      onChange={handleChange}
    />
  );
}

function MembershipFilter({ timetableFilters }: any) {
  const { filters, filteredMembershipList, setFilter } = timetableFilters;
  function handleChange(value: any) {
    setFilter("memberships", value);
  }

  const value = filters ? filters["memberships"] || [] : null;

  return (
    <Select
      placeholder="All"
      options={filteredMembershipList}
      value={value}
      fieldNames={{ label: "name", value: "id" }}
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Memberships"
      style={{ width: "240px" }}
      onChange={handleChange}
    />
  );
}

function ProjectFilter({ timetableFilters }: any) {
  const { filters, filteredProjectList, setFilter } = timetableFilters;

  function handleChange(value: any) {
    setFilter("projects", value);
  }

  const value = filters ? filters["projects"] || [] : null;

  return (
    <Select
      placeholder="All"
      options={filteredProjectList}
      value={value}
      fieldNames={{ label: "name", value: "id" }}
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Projects"
      style={{ width: "240px" }}
      onChange={handleChange}
    />
  );
}

export function Filters({ timetableFilters, scope = null }: any) {
  const { filters, resetFilters } = timetableFilters;
  return (
    <div className="Timetable-filters">
      {(!scope || scope.includes("date")) && (
        <DateFilter timetableFilters={timetableFilters} />
      )}
      {(!scope || scope.includes("user")) && (
        <MembershipFilter timetableFilters={timetableFilters} />
      )}
      {(!scope || scope.includes("project")) && (
        <ProjectFilter timetableFilters={timetableFilters} />
      )}
      <Button type="link" disabled={!filters} onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}
