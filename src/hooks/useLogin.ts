import { useState } from "react";
import { authAPI } from "../api";
import { membershipStorage, userStorage } from "../utils/storage";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setIsLoading(true);
    const { OK, data, error } = await authAPI.login(email, password);
    if (data) {
      userStorage.setAccessToken(data.tokens.user.accessToken);
      membershipStorage.setAccessToken(data.tokens.membership.accessToken);
      setIsLoading(false);
    }

    return { OK, data, error };
  }

  function isLoggedIn() {
    const token = userStorage.getAccessToken();
    return !!token;
  }

  return { isLoading, login, isLoggedIn };
}
