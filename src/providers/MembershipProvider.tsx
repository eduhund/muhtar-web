import { useState, ReactNode, useEffect } from "react";
import { Membership, MembershipContext } from "../context/MembershipContext";
import { membershipStorage } from "../utils/storage";

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membership, setMembership] = useState<Membership | null>(null);

  function checkUserToken() {
    if (!membershipStorage.hasAccessToken()) {
      setMembership(null);
    }
  }

  useEffect(() => {
    checkUserToken();
  }, []);

  return (
    <MembershipContext.Provider value={{ membership, setMembership }}>
      {children}
    </MembershipContext.Provider>
  );
}
