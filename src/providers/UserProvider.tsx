import { useState, ReactNode, useEffect } from "react";
import { User, UserContext } from "../context/UserContext";
import { userStorage } from "../utils/storage";
import { userAPI } from "../api";

function redirectToLogin() {
  window.location.replace("/login");
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

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
      {children}
    </UserContext.Provider>
  );
}
