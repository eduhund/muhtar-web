import { useEffect, useState } from "react";
import { userAPI } from "../api";
import { userStorage } from "../utils/storage";
import { useUser } from "../context/UserContext";

function redirectToLogin() {
  window.location.replace("/login");
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(true);

  const { user, updateUser } = useUser();

  async function fetchUser() {
    if (!userStorage.hasAccessToken()) {
      updateUser(null);
      redirectToLogin();
    } else {
      const userData = await userAPI.getMe();
      updateUser(userData?.user);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isLoading };
}
