import { membershipAPI, userAPI } from "../api";

class StorageAdapter {
  static getItem(key: string) {
    return localStorage.getItem(key);
  }

  static setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  static removeItem(key: string) {
    localStorage.removeItem(key);
  }

  static hasItem(key: string) {
    return localStorage.getItem(key) !== null;
  }
}

export const userStorage = (() => {
  const prefix = "user_";

  return {
    getAccessToken: () => StorageAdapter.getItem(`${prefix}accessToken`),
    setAccessToken: (token: string) => {
      StorageAdapter.setItem(`${prefix}accessToken`, token);
      userAPI.setToken(token);
    },
    removeAccessToken: () => {
      StorageAdapter.removeItem(`${prefix}accessToken`);
      userAPI.setToken(null);
    },
    hasAccessToken: () => StorageAdapter.hasItem(`${prefix}accessToken`),
  };
})();

export const membershipStorage = (() => {
  const prefix = "membership_";

  return {
    getAccessToken: () => StorageAdapter.getItem(`${prefix}accessToken`),
    setAccessToken: (token: string) => {
      StorageAdapter.setItem(`${prefix}accessToken`, token);
      membershipAPI.setToken(token);
    },
    removeAccessToken: () => {
      StorageAdapter.removeItem(`${prefix}accessToken`);
      membershipAPI.setToken(null);
    },
    hasAccessToken: () => StorageAdapter.hasItem(`${prefix}accessToken`),
  };
})();
