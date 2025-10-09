import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { userAPI } from "../api";

export interface User {
  id: string;
  name: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

function redirectToLogin() {
  window.location.replace("/login");
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchUser() {
    const token = localStorage.getItem("userAccessToken");
    if (!token) {
      setUser(null);
      redirectToLogin();
    } else {
      const userData = await userAPI.getMe();
      setUser(userData?.user);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
