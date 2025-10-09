import { useState } from "react";
import { authAPI } from "../api";
import { userStorage } from "../utils/storage";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string) {
    setIsLoading(true);
    const userData = await authAPI.login(email, password);
    if (!userData?.user) {
      throw new Error("Login failed");
    }
    userStorage.setAccessToken(userData.tokens.userAccessToken);
    setIsLoading(false);
    return userData;
  }

  return { login, isLoading };
}
