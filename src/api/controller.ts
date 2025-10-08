export default class APIController {
  baseUri: string;
  constructor(baseUri: string) {
    this.baseUri = baseUri;
  }

  private async apiFetch(uri: string, options: RequestInit) {
    const responce = await fetch(uri, options);
    if (!responce.ok) {
      throw new Error(`API request failed with status ${responce.status}`);
    }
    return await responce.json();
  }

  async get(
    endpoint: string,
    token: string,
    query: { [key: string]: string }
  ): Promise<Response> {
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

  async post(
    endpoint: string,
    token: string | null,
    body: { [key: string]: unknown }
  ): Promise<Response> {
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
