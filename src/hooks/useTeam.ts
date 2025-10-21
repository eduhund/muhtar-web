import { useContext } from "react";
import { Membership, AppContext } from "../context/AppContext";

export function useTeam() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { team, teamLoading, updateState } = context;

  function updateMembership(newMembership: Membership) {
    updateState({ membership: newMembership });
  }

  return { team, isLoading: teamLoading, updateMembership };
}
