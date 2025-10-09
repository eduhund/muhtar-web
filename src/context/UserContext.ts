import { createContext } from "react";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
