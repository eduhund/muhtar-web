import { useContext, useMemo } from "react";
import { AppContext, ProjectMembership } from "../context/AppContext";
import { membershipAPI } from "../api";

export function useProjects() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { projects, projectsLoading, updateState } = context;

  const activeProjects = useMemo(
    () => (projects || [])?.filter((project) => project.status === "active"),
    [projects]
  );

  async function addProjectMembership(
    projectId: string,
    {
      membershipId,
      accessRole = "member",
      workRole = "staff",
      multiplier = 1,
    }: ProjectMembership
  ) {
    const { OK } = await membershipAPI.addProjectMembership(projectId, {
      membershipId,
      accessRole,
      workRole,
      multiplier,
    });
    if (OK && projects) {
      const updatedProjects = projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            memberships: [
              ...(project.memberships || []),
              {
                membershipId,
                accessRole,
                workRole,
                multiplier,
              },
            ],
          };
        }
        return project;
      });
      updateState({ projects: updatedProjects });
    }
    return OK;
  }

  return {
    projects,
    activeProjects,
    isLoading: projectsLoading,
    addProjectMembership,
  };
}
