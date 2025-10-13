import { useMemo } from "react";

import { DatePicker, Select, Button } from "antd";

import { defaultListSort } from "../../../utils/helpers";

const { RangePicker } = DatePicker;

function DateFilter({ filters, onChange }: any) {
  function handleChange(date: any) {
    onChange("date", date);
  }

  const dateFormat = "DD MMMM YYYY";

  return (
    <RangePicker
      placeholder={["From", "To"]}
      value={filters["date"] || []}
      format={dateFormat}
      style={{ width: "280px" }}
      onChange={handleChange}
    />
  );
}

function MembershipFilter({ data, filters, onChange }: any) {
  const membershipList = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; key: string }[] = [];
    data.forEach((item: any) => {
      if (
        item.project.id &&
        item.membership.name &&
        !seen.has(item.membership.id)
      ) {
        seen.add(item.membership.id);
        result.push({ value: item.membership.name, key: item.membership.id });
      }
    });
    return result;
  }, [data]);

  function handleChange(value: any) {
    onChange("memberships", value);
  }

  return (
    <Select
      placeholder="All"
      options={membershipList}
      value={filters["userName"] || null}
      optionFilterProp="value"
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
    const result: { value: string; key: string }[] = [];
    data.forEach((item: any) => {
      if (item.project.id && item.project.name && !seen.has(item.project.id)) {
        seen.add(item.project.id);
        result.push({ value: item.project.name, key: item.project.id });
      }
    });
    return result;
  }, [data]);

  function handleChange(value: any) {
    onChange("projects", value);
  }

  return (
    <Select
      placeholder="All"
      options={projectList}
      value={filters["projectName"] || null}
      optionFilterProp="value"
      filterSort={defaultListSort}
      mode="multiple"
      allowClear
      prefix="Projects"
      style={{ width: "240px" }}
      onChange={handleChange}
    />
  );
}

export function Filters({ data, filters, setFilters, scope = null }: any) {
  function handleChange(column: any, value: any) {
    setFilters((prevFilters: any) => {
      if (value && value.length > 0) return { ...prevFilters, [column]: value };
      else {
        const { [column]: _, ...rest } = prevFilters;
        return rest;
      }
    });
  }

  function resetFilters() {
    setFilters({});
  }

  return (
    <div className="Timetable-filters">
      {(!scope || scope.includes("date")) && (
        <DateFilter filters={filters} onChange={handleChange} />
      )}
      {(!scope || scope.includes("user")) && (
        <MembershipFilter
          data={data}
          filters={filters}
          onChange={handleChange}
        />
      )}
      {(!scope || scope.includes("project")) && (
        <ProjectFilter data={data} filters={filters} onChange={handleChange} />
      )}
      <Button
        type="link"
        disabled={Object.keys(filters).length === 0}
        onClick={resetFilters}
      >
        Reset
      </Button>
    </div>
  );
}
