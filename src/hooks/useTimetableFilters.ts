import { useMemo, useState } from "react";
import { Timetable, TimetableItem } from "../context/TimetableContext";
import { dateOnlyISOString } from "../utils/date";

type Filters = {
  date?: [Date, Date];
  projects?: string[];
  memberships?: string[];
};

export function useTimetableFilters(data: Timetable) {
  const [filters, setFilters] = useState<Filters>({});

  function filterByDate(entry: TimetableItem, date?: [Date, Date]) {
    if (!date) return true;
    const [from, to] = date;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setDate(fromDate.getDate() + 1);
    toDate.setDate(toDate.getDate() + 1);
    const fromDateString = dateOnlyISOString(fromDate);
    const toDateString = dateOnlyISOString(toDate);
    if (fromDateString && entry.date < fromDateString) return false;
    if (toDateString && entry.date > toDateString) return false;
    return true;
  }

  function filterByMemberships(entry: TimetableItem, memberships?: string[]) {
    if (!memberships || memberships.length === 0) return true;
    return memberships.includes(entry.membership?.id);
  }

  function filterByProjects(entry: TimetableItem, projects?: string[]) {
    if (!projects || projects.length === 0) return true;
    return projects.includes(entry.project?.id);
  }

  const filteredList = useMemo(() => {
    return data.filter((entry: TimetableItem) => {
      return (
        filterByDate(entry, filters.date) &&
        filterByMemberships(entry, filters.memberships) &&
        filterByProjects(entry, filters.projects)
      );
    });
  }, [data, filters]);

  function setFilter<K extends keyof Filters>(field: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }
  function resetFilters() {
    setFilters({});
  }

  return { filters, setFilter, resetFilters, filteredList };
}
