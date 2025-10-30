import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useSidebarExpanded() {
  const location = useLocation();
  const isExpanded = useMemo(
    () => location.pathname === "/",
    [location.pathname]
  );
  return isExpanded;
}
