import { useState, ReactNode, useEffect } from "react";
import { User, UserContext } from "../context/UserContext";
import { userStorage } from "../utils/storage";

function redirectToLogin() {
  window.location.replace("/login");
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function checkUserToken() {
    if (!userStorage.hasAccessToken()) {
      setUser(null);
      redirectToLogin();
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
