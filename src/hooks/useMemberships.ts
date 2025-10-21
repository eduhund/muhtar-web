import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function useMemberships() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { memberships, membershipsLoading } = context;

  return { memberships, isLoading: membershipsLoading };
}
