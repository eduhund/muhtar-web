type ApiResponse<T> = {
  OK: boolean;
  data?: T;
  error?: {
    code?: string | number;
    message?: string;
    details?: unknown;
  };
};

export default class APIController {
  baseUri: string;
  constructor(baseUri: string) {
    this.baseUri = baseUri;
  }

  private async apiFetch<T>(
    uri: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const responce = await fetch(uri, options);
    let payload: ApiResponse<T> = { OK: false };
    try {
      payload = await responce.json();
    } catch {
      console.error(
        `API response is not valid JSON. Status: ${responce.status}`
      );
      return {
        OK: false,
        error: {
          code: responce.status,
          message: "Invalid JSON response",
        },
      };
    }

    if (!responce.ok || payload?.OK === false) {
      const code = payload?.error?.code || responce.status;
      const message =
        payload?.error?.message ||
        `API request failed with status ${responce.status}`;
      console.error(message);
      return {
        OK: false,
        error: {
          code,
          message,
        },
      };
    }

    return {
      OK: true,
      data: payload.data,
    };
  }

  async get<T>(
    endpoint: string,
    token: string,
    query?: { [key: string]: string }
  ): Promise<ApiResponse<T>> {
    const queryString = new URLSearchParams(query).toString();
    const path = `${endpoint}?${queryString}`;
    return this.apiFetch(`${this.baseUri}/${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  }

  async post<T>(
    endpoint: string,
    token: string | null,
    body?: { [key: string]: unknown }
  ): Promise<ApiResponse<T>> {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      Object.assign(headers, { Authorization: `Bearer ${token}` });
    }
    return this.apiFetch(`${this.baseUri}/${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }
}
