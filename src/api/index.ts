import APIController from "./controller";

const BASE_URI = import.meta.env.VITE_BASE_URI || "http://localhost:3000/api";

type LoginResponseDataType = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokens: {
    userAccessToken: string;
    userRefreshToken: string;
  };
};

const apiController = new APIController(BASE_URI);

class privateAPI {
  controller: APIController;
  token: string | null = null;
  constructor(controller: APIController) {
    this.controller = controller;
  }

  setToken(token: string) {
    this.token = token;
  }
}

class AuthAPI {
  private prefix = "auth";
  private controller: APIController;
  constructor(controller: APIController) {
    this.controller = controller;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ OK: boolean; data?: LoginResponseDataType; error?: unknown }> {
    return this.controller.post<LoginResponseDataType>(
      `${this.prefix}/login`,
      null,
      {
        email,
        password,
      }
    );
  }
}

class UserAPI extends privateAPI {
  private prefix = "user";
  constructor(controller: APIController) {
    super(controller);
  }

  async getMe() {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/me`, this.token);
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
