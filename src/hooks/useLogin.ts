import { useState } from "react";
import { authAPI } from "../api";
import { memberrshipStorage, userStorage } from "../utils/storage";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setIsLoading(true);
    const { OK, data, error } = await authAPI.login(email, password);
    if (data) {
      userStorage.setAccessToken(data.tokens.user);
      memberrshipStorage.setAccessToken(data.tokens.membership);
      setIsLoading(false);
    }

    return { OK, data, error };
  }

  return { login, isLoading };
}
