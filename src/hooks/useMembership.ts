import { useContext, useState } from "react";
import { Membership, MembershipContext } from "../context/MembershipContext";
import { membershipAPI } from "../api";
import { membershipStorage } from "../utils/storage";

export function useMembership() {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  const { membership, setMembership } = context;
  const membershipToken = membershipStorage.getAccessToken();
  membershipAPI.setToken(membershipToken);

  function updateMembership(newMembership: Membership | null) {
    setMembership(newMembership);
  }

  async function getTime(query: { [key: string]: string }) {
    setIsLoading(true);
    const data = await membershipAPI.getTime(query);
    setIsLoading(false);
    return data;
  }

  return { membership, isLoading, updateMembership, getTime };
}
