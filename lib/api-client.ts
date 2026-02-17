import { LoginSchema, RegisterSchema, DrillConfigSchema } from "./schema";
import {
  LoginResponse,
  RegisterResponse,
  DrillLog,
  Question,
  DrillAttemptPayload,
  DrillAttemptResponse,
} from "../app/types";

type Options = {
  method: string;
  headers?: Record<string, string>;
  body?: string | Record<string, string> | DrillAttemptPayload;
  id?: string;
  filters?: Record<string, any>;
};

export class APIClientError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

class DrillEndPoints {
  #baseurl = "/api/proxy";

  async #request(url: string, options: Options) {
    const { method = "GET", headers = {}, body, filters = {} } = options;

    let endpoint = `${this.#baseurl}${url}`;

    if (filters) {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach((element) => {
        const value = filters[element];
        if (value !== undefined) {
          queryParams.append(element, value.toString());
        }
      });

      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    console.log(endpoint);

    const config: RequestInit = {
      method,
      signal: AbortSignal.timeout(10000),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body)
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    try {
      const response = await fetch(endpoint, config);
      const data = await response.json();
      if (!response.ok)
        throw new APIClientError(
          data.message || response.statusText,
          response.status
        );

      return data;
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }
      throw new APIClientError("A network or unexpected error occurred.", 500);
    }
  }

  async getDrillLogs(): Promise<DrillLog[]> {
    return this.#request("/drills/logs", { method: "GET" });
  }

  async getQuestions(config: DrillConfigSchema): Promise<Question[]> {
    return this.#request("/drills/questions", {
      method: "GET",
      filters: config,
    });
  }

  async submitDrillAttempt(
    payload: DrillAttemptPayload
  ): Promise<DrillAttemptResponse> {
    return this.#request("/drills/submit", {
      method: "POST",
      body: payload,
    });
  }

  async login(payload: LoginSchema): Promise<LoginResponse> {
    return this.#request("/auth/login", {
      method: "POST",
      body: {
        ...payload,
      },
    });
  }

  async register(payload: RegisterSchema): Promise<RegisterResponse> {
    return this.#request("/auth/register", {
      method: "POST",
      body: {
        ...payload,
      },
    });
  }
}

export const apiClient = new DrillEndPoints();
