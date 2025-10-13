import { useState, ReactNode, useEffect } from "react";
import { Membership, MembershipContext } from "../context/MembershipContext";
import { membershipStorage } from "../utils/storage";
import { membershipAPI } from "../api";

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membership, setMembership] = useState<Membership | null>(null);

  async function checkUserToken() {
    if (!membershipStorage.hasAccessToken()) {
      console.log("No membership token found");
    } else {
      const userToken = membershipStorage.getAccessToken();
      membershipAPI.setToken(userToken);
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
