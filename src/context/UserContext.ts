import { createContext } from "react";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
