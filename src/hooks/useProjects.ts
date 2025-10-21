import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function useProjects() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { projects, projectsLoading } = context;

  return { projects, isLoading: projectsLoading };
}
