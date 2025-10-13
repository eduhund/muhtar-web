import { useMemo } from "react";

import { DatePicker, Select, Button } from "antd";

import { defaultListSort } from "../../../utils/helpers";

const { RangePicker } = DatePicker;

function DateFilter({ filters, onChange }: any) {
  function handleChange(date: any) {
    onChange("date", date);
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

function MembershipFilter({ data, filters, onChange }: any) {
  const membershipList = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    data.forEach((item: any) => {
      if (
        item.project.id &&
        item.membership.name &&
        !seen.has(item.membership.id)
      ) {
        seen.add(item.membership.id);
        result.push({ value: item.membership.id, label: item.membership.name });
      }
    });
    return result;
  }, [data]);

  function handleChange(value: any) {
    onChange("memberships", value);
  }

  const value = filters ? filters["memberships"] || [] : null;

  return (
    <Select
      placeholder="All"
      options={membershipList}
      value={value}
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Memberships"
      style={{ width: "240px" }}
      onChange={handleChange}
    />
  );
}

function ProjectFilter({ data, filters, onChange }: any) {
  const projectList = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    data.forEach((item: any) => {
      if (item.project.id && item.project.name && !seen.has(item.project.id)) {
        seen.add(item.project.id);
        result.push({ value: item.project.id, label: item.project.name });
      }
    });
    return result;
  }, [data]);

  function handleChange(value: any) {
    onChange("projects", value);
  }

  const value = filters ? filters["projects"] || [] : null;

  return (
    <Select
      placeholder="All"
      options={projectList}
      value={value}
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Projects"
      style={{ width: "240px" }}
      onChange={handleChange}
    />
  );
}

export function Filters({
  data,
  filters,
  setFilter,
  resetFilters,
  scope = null,
}: any) {
  return (
    <div className="Timetable-filters">
      {(!scope || scope.includes("date")) && (
        <DateFilter filters={filters} onChange={setFilter} />
      )}
      {(!scope || scope.includes("user")) && (
        <MembershipFilter data={data} filters={filters} onChange={setFilter} />
      )}
      {(!scope || scope.includes("project")) && (
        <ProjectFilter data={data} filters={filters} onChange={setFilter} />
      )}
      <Button type="link" disabled={!filters} onClick={resetFilters}>
        Reset
      </Button>
    </div>
  );
}
