import { DatePicker, Select, Button } from "antd";

import { defaultListSort } from "../../../utils/helpers";
import { dateFormat } from "../../../utils/date";
import ProjectDropdown from "../../../components/ProjectDropdown/ProjectDropdown";
import MembershipDropdown from "../../../components/MembershipDropdown/MembershipDropdown";

const { RangePicker } = DatePicker;

function DateFilter({ timetableFilters }: any) {
  const { filters, setFilter } = timetableFilters;
  function handleChange(date: [any, any] | null) {
    setFilter("date", date);
  }

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
  function handleChange(value: string[]) {
    setFilter("memberships", value);
  }

  const value = filters ? filters["memberships"] || [] : null;

  return (
    <MembershipDropdown
      memberships={filteredMembershipList}
      onChange={handleChange}
      value={value}
      placeholder="All"
      isMultiple={true}
      style={{ width: "240px" }}
    />
  );
}

function ProjectFilter({ timetableFilters }: any) {
  const { filters, filteredProjectList, setFilter } = timetableFilters;

  function handleChange(value: string[]) {
    setFilter("projects", value);
  }

  const value = filters ? filters["projects"] || [] : null;

  return (
    <ProjectDropdown
      projects={filteredProjectList}
      onChange={handleChange}
      value={value}
      placeholder="All"
      isMultiple={true}
      style={{ width: "240px" }}
    />
  );
}

export function Filters({ timetableFilters, scope = null }: any) {
  const { filters, resetFilters } = timetableFilters;
  return (
    <>
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
    </>
  );
}
