import { useState, useEffect } from "react";
import {
  User,
  Membership,
  Team,
  Project,
  Resources,
  AppContext,
  Task,
} from "../context/AppContext";
import { membershipStorage, userStorage } from "../utils/storage";
import { membershipAPI, userAPI } from "../api";

type AppState = {
  user: User | null;
  userLoading: boolean;
  membership: Membership | null;
  membershipLoading: boolean;
  memberships: Membership[] | null;
  membershipsLoading: boolean;
  team: Team | null;
  teamLoading: boolean;
  teams: Team[] | null;
  teamsLoading: boolean;
  projects: Project[] | null;
  projectsLoading: boolean;
  resources: Resources | null;
  resourcesLoading: boolean;
  tasks?: Task[] | null;
  tasksLoading?: boolean;
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
    teams: null,
    teamsLoading: false,
    projects: null,
    projectsLoading: false,
    resources: null,
    resourcesLoading: false,
    tasks: null,
    tasksLoading: false,
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
      teams: null,
      memberships: null,
    }));
  }

  async function initUserData() {
    setState((prev) => ({
      ...prev,
      userLoading: true,
      membershipLoading: true,
      teamLoading: true,
      projectsLoading: true,
      membershipsLoading: true,
    }));
    const { data } = (await userAPI.getMe()) as { data: any };
    if (data) {
      setState((prev) => ({
        ...prev,
        user: {
          id: data.id,
          email: data.email,
          name: data.name,
          firstName: data.firstName,
          lastName: data.lastName,
        },
        membership: data.activeMembership || null,
        team: {
          id: data.activeTeam?.id,
          name: data.activeTeam?.name,
          connections: data.activeTeam?.connections || [],
          isDeleted: data.activeTeam?.isDeleted || false,
          history: data.activeTeam?.history || [],
          workRoles: data.activeTeam?.workRoles || [],
        },
        memberships: data.activeTeam?.memberships || [],
        teams: data.teams || [],
        projects: data.activeTeam?.projects || [],
        userLoading: false,
        membershipLoading: false,
        teamLoading: false,
        projectsLoading: false,
        membershipsLoading: false,
      }));
    } else {
      logOut();
    }
  }

  async function initResources() {
    setState((prev) => ({ ...prev, resourcesLoading: true }));
    const { data } = await membershipAPI.getResources({});
    setState((prev) => ({
      ...prev,
      resources: data || null,
      resourcesLoading: false,
    }));
  }

  async function initTasks() {
    setState((prev) => ({ ...prev, tasksLoading: true }));
    const { data } = await membershipAPI.getTasks({});
    setState((prev) => ({
      ...prev,
      tasks: (data as Task[]) || null,
      tasksLoading: false,
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
    initResources();
    initTasks();
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
