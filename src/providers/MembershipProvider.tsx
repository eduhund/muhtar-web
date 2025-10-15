import { useState, ReactNode, useEffect } from "react";
import { Membership, MembershipContext } from "../context/MembershipContext";
import { membershipStorage } from "../utils/storage";
import { membershipAPI } from "../api";

export function MembershipProvider({
  children,
  membership,
}: {
  children: ReactNode;
  membership: Membership | null;
}) {
  const [activeMembership, setMembership] = useState<Membership | null>(
    membership
  );

  async function checkMembershioToken() {
    if (!membershipStorage.hasAccessToken()) {
      console.log("No membership token found");
    } else {
      const userToken = membershipStorage.getAccessToken();
      membershipAPI.setToken(userToken);
    }
  }

  useEffect(() => {
    checkMembershioToken();
  }, []);

  return (
    <MembershipContext.Provider
      value={{ membership: activeMembership, setMembership }}
    >
      {children}
    </MembershipContext.Provider>
  );
}
