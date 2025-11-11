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

  async function addMemberToProject(projectId: string, memberId: string) {
    // Implementation for adding a member to a project
    // This is a placeholder and should be replaced with actual logic
    console.log(`Adding member ${memberId} to project ${projectId}`);
    return true;
  }

  return {
    projects,
    activeProjects,
    isLoading: projectsLoading,
    addMemberToProject,
  };
}
