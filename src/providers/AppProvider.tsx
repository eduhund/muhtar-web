import { useState, useEffect } from "react";
import {
  User,
  Membership,
  Team,
  Project,
  Timetable,
  AppContext,
} from "../context/AppContext";
import { membershipStorage, userStorage } from "../utils/storage";
import { membershipAPI, userAPI } from "../api";

function redirectToLogin() {
  window.location.replace("/login");
}

type AppState = {
  user: User | null;
  userLoading: boolean;
  membership: Membership | null;
  membershipLoading: boolean;
  memberships: Membership[] | null;
  membershipsLoading: boolean;
  team: Team | null;
  teamLoading: boolean;
  projects: Project[] | null;
  projectsLoading: boolean;
  timetable: Timetable | null;
  timetableLoading: boolean;
};
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    userLoading: false,
    membership: null,
    membershipLoading: false,
    memberships: null,
    membershipsLoading: false,
    team: null,
    teamLoading: false,
    projects: null,
    projectsLoading: false,
    timetable: null,
    timetableLoading: false,
  });

  function logOut() {
    userStorage.clear();
    membershipStorage.clear();
    setState((prev) => ({
      ...prev,
      user: null,
      membership: null,
      team: null,
      projects: null,
      timetable: null,
      memberships: null,
    }));
    redirectToLogin();
  }

  async function initUserData() {
    setState((prev) => ({
      ...prev,
      userLoading: true,
      membershipLoading: true,
      teamLoading: true,
    }));
    const { data } = (await userAPI.getMe()) as any;
    if (data) {
      setState((prev) => ({
        ...prev,
        user: data,
        membership: data.activeMembership || null,
        team: data.activeTeam || null,
        userLoading: false,
        membershipLoading: false,
        teamLoading: false,
      }));
    } else {
      logOut();
    }
  }

  async function initTimetable() {
    setState((prev) => ({ ...prev, timetableLoading: true }));
    const { data } = await membershipAPI.getTimetable({});
    setState((prev) => ({
      ...prev,
      timetable: data || null,
      timetableLoading: false,
    }));
  }

  async function initProjects() {
    setState((prev) => ({ ...prev, projectsLoading: true }));
    const { data } = await membershipAPI.getProjects();
    setState((prev) => ({
      ...prev,
      projects: (data as Project[]) || null,
      projectsLoading: false,
    }));
  }

  async function initProvider() {
    if (!userStorage.hasAccessToken()) {
      logOut();
    } else {
      const userToken = userStorage.getAccessToken();
      const membershipToken = membershipStorage.getAccessToken();
      userAPI.setToken(userToken);
      membershipAPI.setToken(membershipToken);
    }
    initUserData();
    initTimetable();
    initProjects();
  }

  useEffect(() => {
    initProvider();
  }, []);

  const updateState = (partialState: Partial<AppContext>) => {
    setState((prev) => ({ ...prev, ...partialState }));
  };

  return (
    <AppContext.Provider value={{ ...state, updateState }}>
      {children}
    </AppContext.Provider>
  );
}
