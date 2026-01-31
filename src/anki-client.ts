// ============================================================================
// AnkiConnect HTTP Client - Bun Native
// ============================================================================

import type { AnkiConnectResponse } from "./types";

export class AnkiConnectError extends Error {
  constructor(
    message: string,
    public readonly action: string,
    public readonly params?: unknown
  ) {
    super(message);
    this.name = "AnkiConnectError";
  }
}

export interface AnkiClientConfig {
  url?: string;
  version?: number;
  apiKey?: string;
  timeout?: number;
}

export class AnkiClient {
  private readonly url: string;
  private readonly version: number;
  private readonly apiKey?: string;
  private readonly timeout: number;

  constructor(config: AnkiClientConfig = {}) {
    this.url = config.url ?? process.env.ANKI_CONNECT_URL ?? "http://localhost:8765";
    this.version = config.version ?? 6;
    this.apiKey = config.apiKey ?? process.env.ANKI_CONNECT_API_KEY;
    this.timeout = config.timeout ?? 10000;
  }

  async invoke<T = unknown>(action: string, params: Record<string, unknown> = {}): Promise<T> {
    const body: Record<string, unknown> = {
      action,
      version: this.version,
      params,
    };

    if (this.apiKey) {
      body.key = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new AnkiConnectError(
          `HTTP ${response.status}: ${response.statusText}`,
          action,
          params
        );
      }

      const data = (await response.json()) as AnkiConnectResponse<T>;

      if (data.error) {
        throw new AnkiConnectError(data.error, action, params);
      }

      return data.result;
    } catch (error) {
      if (error instanceof AnkiConnectError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new AnkiConnectError(`Request timed out after ${this.timeout}ms`, action, params);
      }

      throw new AnkiConnectError(
        error instanceof Error ? error.message : "Unknown error",
        action,
        params
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Convenience method for multi-action requests
  async multi<T extends unknown[]>(
    actions: Array<{ action: string; params?: Record<string, unknown> }>
  ): Promise<T> {
    return this.invoke<T>("multi", {
      actions: actions.map((a) => ({
        action: a.action,
        version: this.version,
        params: a.params ?? {},
      })),
    });
  }
}

export function getAnkiClient(config?: AnkiClientConfig): AnkiClient {
  return new AnkiClient(config);
}
