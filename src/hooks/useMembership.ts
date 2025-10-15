import { useContext } from "react";
import { Membership, AppContext } from "../context/AppContext";
import { membershipAPI } from "../api";
import { membershipStorage } from "../utils/storage";

export function useMembership() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { membership, membershipLoading, updateState } = context;
  const membershipToken = membershipStorage.getAccessToken();
  membershipAPI.setToken(membershipToken);

  function updateMembership(newMembership: Membership) {
    updateState({ membership: newMembership });
  }

  return { membership, isLoading: membershipLoading, updateMembership };
}
