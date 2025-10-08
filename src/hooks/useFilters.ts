import { useState, useMemo } from "react";

export function useFilters(data: any, defaultFilters: any = {}) {
  const [filters, setFilters] = useState(defaultFilters) as any;

  function resetFilters() {
    setFilters(() => defaultFilters);
  }

  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      for (const [key, value] of Object.entries(filters) as any) {
        if (key === "date" && value) {
          const dates = value?.map((item: any) => item?.toDate());
          const [start, end] = dates;
          const date = new Date(item[key]);
          if ((start && start > date) || (end && end < date)) return false;
        } else if (Array.isArray(value)) {
          if (value.length > 0 && !value.includes(item[key])) return false;
        } else if (value && item[key] !== value) return false;
      }
      return true;
    });
  }, [data, filters]);

  return { filters, setFilters, resetFilters, filteredData };
}
