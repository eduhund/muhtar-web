import APIController from "./controller";

const BASE_URI = import.meta.env.VITE_BASE_URI || "http://localhost:3000/api";

const apiController = new APIController(BASE_URI);

class API {
  controller: APIController;
  token: string | null = null;
  constructor(controller: APIController) {
    this.controller = controller;
  }

  setToken(token: string) {
    this.token = token;
  }
}

class AuthAPI extends API {
  private prefix = "auth";
  constructor(controller: APIController) {
    super(controller);
  }

  async login(username: string, password: string) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/login`, this.token, {
      username,
      password,
    });
  }
}

class UserAPI extends API {
  private prefix = "user";
  constructor(controller: APIController) {
    super(controller);
  }

  async changeTeam(teamId: string) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/changeTeam`, this.token, {
      teamId,
    });
  }
}

export const authAPI = new AuthAPI(apiController);
export const userAPI = new UserAPI(apiController);
