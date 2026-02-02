import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export function useTeams() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  const { teams, teamsLoading } = context;

  return { teams, isLoading: teamsLoading };
}
