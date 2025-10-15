import { createContext } from "react";

export interface Membership {
  id: string;
  name: string;
  team: {
    name: string;
  };
}

export interface MembershipContextType {
  membership: Membership | null;
  setMembership: (membership: Membership | null) => void;
}

export const MembershipContext = createContext<
  MembershipContextType | undefined
>(undefined);
