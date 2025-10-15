import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { membershipAPI } from "../api";
import { membershipStorage } from "../utils/storage";

export function useProjects() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { projects, projectsLoading } = context;
  const membershipToken = membershipStorage.getAccessToken();
  membershipAPI.setToken(membershipToken);

  return { projects, isLoading: projectsLoading };
}
