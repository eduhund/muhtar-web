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
    setAccessToken: (token: string) =>
      StorageAdapter.setItem(`${prefix}accessToken`, token),
    removeAccessToken: () => StorageAdapter.removeItem(`${prefix}accessToken`),
    hasAccessToken: () => StorageAdapter.hasItem(`${prefix}accessToken`),
  };
})();

export const memberrshipStorage = (() => {
  const prefix = "membership_";

  return {
    getAccessToken: () => StorageAdapter.getItem(`${prefix}accessToken`),
    setAccessToken: (token: string) =>
      StorageAdapter.setItem(`${prefix}accessToken`, token),
    removeAccessToken: () => StorageAdapter.removeItem(`${prefix}accessToken`),
    hasAccessToken: () => StorageAdapter.hasItem(`${prefix}accessToken`),
  };
})();
