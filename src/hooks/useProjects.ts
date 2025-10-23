import { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

export function useProjects() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { projects, projectsLoading } = context;

  const activeProjects = useMemo(
    () => (projects || [])?.filter((project) => project.status === "active"),
    [projects]
  );

  return { projects, activeProjects, isLoading: projectsLoading };
}
