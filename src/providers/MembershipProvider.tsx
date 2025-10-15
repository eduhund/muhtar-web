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
  const [isReady, setIsReady] = useState(false);

  async function checkMembershioToken() {
    const token = membershipStorage.getAccessToken();
    if (token) {
      membershipAPI.setToken(token);
    }
    setIsReady(true);
  }

  useEffect(() => {
    checkMembershioToken();
  }, []);

  if (!isReady) return null;

  return (
    <MembershipContext.Provider
      value={{ membership: activeMembership, setMembership }}
    >
      {children}
    </MembershipContext.Provider>
  );
}
