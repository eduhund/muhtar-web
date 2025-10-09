import { useContext } from "react";
import { User, UserContext } from "../context/UserContext";
import { userStorage } from "../utils/storage";
import { userAPI } from "../api";

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  const { user, setUser } = context;
  const userToken = userStorage.getAccessToken();
  userAPI.setToken(userToken);

  function updateUser(newUser: User | null) {
    setUser(newUser);
  }

  return { user, updateUser };
}
