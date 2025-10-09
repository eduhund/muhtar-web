import { useState } from "react";
import { authAPI } from "../api";
import { useUser } from "../hooks/useUser";
import { userStorage } from "../utils/storage";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateUser } = useUser();

  async function login(email: string, password: string) {
    if (user) {
      throw new Error("User is already logged in");
    }
    setIsLoading(true);
    const userData = await authAPI.login(email, password);
    if (!userData?.user) {
      throw new Error("Login failed");
    }
    userStorage.setAccessToken(userData.tokens.userAccessToken);
    updateUser(userData?.user);
    setIsLoading(false);
    return userData;
  }

  return { login, isLoading };
}
