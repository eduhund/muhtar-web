import { Timetable, TimetableItem } from "../context/AppContext";
import APIController, { ApiResponse } from "./controller";

const BASE_URI = import.meta.env.VITE_BASE_URI || "http://localhost:3000/api";

type accessTokenType = {
  accessToken: string;
};

type LoginResponseDataType = {
  tokens: {
    user: accessTokenType;
    membership: accessTokenType;
  };
};

type GetTimetableResponseDataType = Timetable;

export type AddTimeEntry = {
  date: string;
  duration: string;
  membershipId: string;
  projectId: string;
  taskId?: string | null;
  comment?: string;
};

const apiController = new APIController(BASE_URI);

class privateAPI {
  controller: APIController;
  token: string | null = null;
  constructor(controller: APIController) {
    this.controller = controller;
  }

  setToken(token: string | null) {
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
  ): Promise<ApiResponse<LoginResponseDataType>> {
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
    return this.controller.get(`${this.prefix}/getMe`, this.token);
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

class MembershipAPI extends privateAPI {
  private prefix = "membership";
  constructor(controller: APIController) {
    super(controller);
  }

  async getTime(query: { [key: string]: string }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/getTime`, this.token, query);
  }

  async getTimetable(query: {
    [key: string]: string;
  }): Promise<ApiResponse<GetTimetableResponseDataType>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(
      `${this.prefix}/getTimetable`,
      this.token,
      query
    );
  }

  async addTime(entry: AddTimeEntry): Promise<ApiResponse<TimetableItem>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/addTime`, this.token, entry);
  }

  async getProjects(query: { [key: string]: string } = {}) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/getProjects`, this.token, query);
  }
}

export const authAPI = new AuthAPI(apiController);
export const userAPI = new UserAPI(apiController);
export const membershipAPI = new MembershipAPI(apiController);
