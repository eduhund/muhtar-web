import { useState } from "react";
import { userAPI } from "../api";
import { useUser } from "../hooks/useUser";
import { userStorage } from "../utils/storage";

function redirectToLogin() {
  window.location.replace("/login");
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateUser } = useUser();

  async function login() {
    if (user) {
      throw new Error("User is already logged in");
    }
    const userData = await userAPI.getMe();
    if (!userData?.user) {
      redirectToLogin();
      return;
    }
    userStorage.setAccessToken(userData.tokens.userAccessToken);
    updateUser(userData?.user);
    setIsLoading(false);
  }

  return { login, isLoading };
}
