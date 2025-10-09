import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { userAPI } from "../api";
import { userStorage } from "../utils/storage";

export interface User {
  id: string;
  name: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

function redirectToLogin() {
  window.location.replace("/login");
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(true);

  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  const { user, setUser } = context;

  async function fetchUser() {
    if (!userStorage.hasAccessToken()) {
      setUser(null);
      redirectToLogin();
    } else {
      const userData = await userAPI.getMe();
      setUser(userData?.user);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isLoading };
};
