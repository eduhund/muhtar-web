import { useState, ReactNode, useEffect } from "react";
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [timetable, setTimetable] = useState<Timetable | null>(null);

  function logOut() {
    userStorage.clear();
    membershipStorage.clear();
    setUser(null);
    setMembership(null);
    setTeam(null);
    setProjects(null);
    setTimetable(null);
    setMemberships(null);
    redirectToLogin();
  }

  async function initUserData() {
    const { data } = (await userAPI.getMe()) as any;
    if (data) {
      setUser(data);
      setMembership(data.activeMembership || null);
      setTeam(data.activeMembership?.team || null);
    } else {
      logOut();
    }
  }

  async function initTimetable() {
    const { data } = await membershipAPI.getTimetable({});
    if (data) {
      setTimetable(data);
    } else {
      setTimetable(null);
    }
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
    await initUserData();
    await initTimetable();
  }

  useEffect(() => {
    initProvider();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        membership,
        projects,
        memberships,
        team,
        timetable,
        setUser,
        setMembership,
        setProjects,
        setMemberships,
        setTeam,
        setTimetable,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
