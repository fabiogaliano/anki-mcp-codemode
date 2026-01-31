import { describe, expect, it, mock, afterEach } from "bun:test";
import { AnkiClient, AnkiConnectError } from "../anki-client";

describe("AnkiClient", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("creates client with default config", () => {
    const client = new AnkiClient();
    expect(client).toBeInstanceOf(AnkiClient);
  });

  it("creates client with custom config", () => {
    const client = new AnkiClient({
      url: "http://custom:9999",
      timeout: 5000,
      apiKey: "secret",
    });
    expect(client).toBeInstanceOf(AnkiClient);
  });

  it("invokes action successfully", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ result: ["Deck1", "Deck2"], error: null }))
      )
    ) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765" });
    const result = await client.invoke<string[]>("deckNames");

    expect(result).toEqual(["Deck1", "Deck2"]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("handles AnkiConnect error response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ result: null, error: "deck not found" }))
      )
    ) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765" });

    await expect(client.invoke("deckNames")).rejects.toThrow(AnkiConnectError);
    await expect(client.invoke("deckNames")).rejects.toThrow("deck not found");
  });

  it("handles HTTP error", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 500, statusText: "Internal Server Error" }))
    ) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765" });

    await expect(client.invoke("deckNames")).rejects.toThrow(AnkiConnectError);
    await expect(client.invoke("deckNames")).rejects.toThrow("500");
  });

  it("handles network error", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("ECONNREFUSED"))) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765" });

    await expect(client.invoke("deckNames")).rejects.toThrow(AnkiConnectError);
    await expect(client.invoke("deckNames")).rejects.toThrow("ECONNREFUSED");
  });

  it("includes api key in request when configured", async () => {
    let capturedBody: string | undefined;
    globalThis.fetch = mock((_url: string, init?: RequestInit) => {
      capturedBody = init?.body as string;
      return Promise.resolve(
        new Response(JSON.stringify({ result: [], error: null }))
      );
    }) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765", apiKey: "mykey" });
    await client.invoke("deckNames");

    expect(capturedBody).toContain('"key":"mykey"');
  });

  it("sends multi action request", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    globalThis.fetch = mock((_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return Promise.resolve(
        new Response(JSON.stringify({ result: [["Deck1"], [1, 2, 3]], error: null }))
      );
    }) as unknown as typeof fetch;

    const client = new AnkiClient({ url: "http://test:8765" });
    const result = await client.multi([
      { action: "deckNames" },
      { action: "findNotes", params: { query: "deck:Test" } },
    ]);

    expect(capturedBody?.action).toBe("multi");
    expect(result).toEqual([["Deck1"], [1, 2, 3]]);
  });
});

describe("AnkiConnectError", () => {
  it("includes action and params", () => {
    const error = new AnkiConnectError("failed", "deckNames", { foo: "bar" });

    expect(error.message).toBe("failed");
    expect(error.action).toBe("deckNames");
    expect(error.params).toEqual({ foo: "bar" });
    expect(error.name).toBe("AnkiConnectError");
  });
});
