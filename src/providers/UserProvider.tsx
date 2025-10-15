import { useState, ReactNode, useEffect } from "react";
import { User, UserContext } from "../context/UserContext";
import { userStorage } from "../utils/storage";
import { userAPI } from "../api";
import { MembershipProvider } from "./MembershipProvider";
import { Membership } from "../context/MembershipContext";

function redirectToLogin() {
  window.location.replace("/login");
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  async function checkUserToken() {
    if (!userStorage.hasAccessToken()) {
      setUser(null);
      redirectToLogin();
    } else {
      const userToken = userStorage.getAccessToken();
      userAPI.setToken(userToken);
      const { data } = (await userAPI.getMe()) as any;
      if (data) {
        setUser(data);
        setMembership(data.activeMembership || null);
      } else {
        setUser(null);
        redirectToLogin();
      }
    }
  }

  useEffect(() => {
    checkUserToken();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <MembershipProvider membership={membership}>
        {children}
      </MembershipProvider>
    </UserContext.Provider>
  );
}
