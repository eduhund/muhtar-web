import { Resources, Resource, BookedResource } from "../context/AppContext";
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

type GetResourcesResponseDataType = Resources;

export type AddResourceEntry = {
  date: string;
  consumed: number;
  membershipId: string;
  projectId: string;
  target: { type: "task" | "job" | "other"; id: string } | null;
  comment?: string;
};

export type UpdateResourceEntry = {
  id: string;
} & Partial<AddResourceEntry>;

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
    password: string,
  ): Promise<ApiResponse<LoginResponseDataType>> {
    return this.controller.post<LoginResponseDataType>(
      `${this.prefix}/login`,
      null,
      {
        email,
        password,
      },
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

  async createTeam({ name }: { name: string }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/createTeam`, this.token, {
      name,
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
    return this.controller.get(`${this.prefix}/getResource`, this.token, query);
  }

  async getResources(query: {
    [key: string]: string;
  }): Promise<ApiResponse<GetResourcesResponseDataType>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(
      `${this.prefix}/getResources`,
      this.token,
      query,
    );
  }

  async spendResource(entry: AddResourceEntry): Promise<ApiResponse<Resource>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/spendResource`,
      this.token,
      entry,
    );
  }

  async updateResource(
    entry: UpdateResourceEntry,
  ): Promise<ApiResponse<Resource>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/updateResource`,
      this.token,
      entry,
    );
  }

  async deleteResource({ id }: { id: string }): Promise<ApiResponse<Resource>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/archiveResource`, this.token, {
      id,
    });
  }

  async restoreResource({
    id,
  }: {
    id: string;
  }): Promise<ApiResponse<Resource>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/restoreResource`, this.token, {
      id,
    });
  }

  async getProjects(query: { [key: string]: string } = {}) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/getProjects`, this.token, query);
  }

  async getMemberships(query: { [key: string]: string } = {}) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(
      `${this.prefix}/getMemberships`,
      this.token,
      query,
    );
  }

  async addProjectMembership(
    projectId: string,
    projectMembership: {
      membershipId: string;
      accessRole: string;
      workRole: string;
      multiplier: number;
    },
  ) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/addProjectMembership`,
      this.token,
      {
        projectId,
        ...projectMembership,
      },
    );
  }

  async updateProjectMembership(
    projectId: string,
    projectMembership: {
      membershipId: string;
      accessRole?: string;
      workRole?: string;
      multiplier?: number;
    },
  ) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/updateProjectMembership`,
      this.token,
      {
        projectId,
        ...projectMembership,
      },
    );
  }

  async removeProjectMembership({
    projectId,
    membershipId,
  }: {
    projectId: string;
    membershipId: string;
  }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/removeProjectMembership`,
      this.token,
      {
        projectId,
        membershipId,
      },
    );
  }

  getTasks(query: { [key: string]: string } = {}) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(`${this.prefix}/getTasks`, this.token, query);
  }

  createTask(task: { name: string; projectId: string }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/createTask`, this.token, task);
  }

  updateTask(task: { id: string; name?: string; projectId?: string }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/updateTask`, this.token, task);
  }

  archiveTask(taskId: string) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/archiveTask`, this.token, {
      id: taskId,
    });
  }

  restoreTask(taskId: string) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(`${this.prefix}/restoreTask`, this.token, {
      id: taskId,
    });
  }

  getBookedResources(query: { [key: string]: string }) {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.get(
      `${this.prefix}/getBookedResources`,
      this.token,
      query,
    );
  }

  bookResource(entry: {
    projectId: string;
    date: string;
    period: string;
    resource: { type: "time"; value: number };
    target: { type: "worker" | "role"; id: string } | null;
    comment?: string;
  }): Promise<ApiResponse<BookedResource>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/bookResource`,
      this.token,
      entry,
    );
  }

  updateBookedResource(entry: {
    id: string;
    value: number;
  }): Promise<ApiResponse<{ OK: boolean }>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/updateBookedResource`,
      this.token,
      entry,
    );
  }

  resetBookedResource(entry: {
    id: string;
  }): Promise<ApiResponse<{ OK: boolean }>> {
    if (!this.token) {
      throw new Error("Token is not set");
    }
    return this.controller.post(
      `${this.prefix}/resetBookedResource`,
      this.token,
      entry,
    );
  }
}

export const authAPI = new AuthAPI(apiController);
export const userAPI = new UserAPI(apiController);
export const membershipAPI = new MembershipAPI(apiController);
