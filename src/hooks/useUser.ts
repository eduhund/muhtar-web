import { useContext } from "react";
import { User, UserContext } from "../context/UserContext";

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  const { user, setUser } = context;

  function updateUser(newUser: User | null) {
    setUser(newUser);
  }

  return { user, updateUser };
}
