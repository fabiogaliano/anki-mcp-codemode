import { describe, expect, it, mock } from "bun:test";
import { executeSandbox, formatSandboxResult } from "../sandbox";

function createMockAPI() {
  return {
    decks: {
      list: mock(() => Promise.resolve(["Deck1", "Deck2"])),
      create: mock(() => Promise.resolve(1)),
    },
    notes: {
      add: mock(() => Promise.resolve(123)),
    },
  };
}

describe("executeSandbox", () => {
  it("captures console.log output", async () => {
    const api = createMockAPI();
    const result = await executeSandbox('console.log("hello")', api);

    expect(result.success).toBe(true);
    expect(result.output).toEqual(["hello"]);
  });

  it("captures multiple logs", async () => {
    const api = createMockAPI();
    const result = await executeSandbox(
      `
      console.log("one");
      console.log("two");
      console.log({ three: 3 });
      `,
      api
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual(["one", "two", { three: 3 }]);
  });

  it("captures return value", async () => {
    const api = createMockAPI();
    const result = await executeSandbox("return 42", api);

    expect(result.success).toBe(true);
    expect(result.output).toEqual([42]);
  });

  it("handles async code", async () => {
    const api = createMockAPI();
    const result = await executeSandbox(
      `
      const x = await Promise.resolve(123);
      console.log(x);
      `,
      api
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual([123]);
  });

  it("catches errors", async () => {
    const api = createMockAPI();
    const result = await executeSandbox('throw new Error("oops")', api);

    expect(result.success).toBe(false);
    expect(result.error).toContain("oops");
  });

  it("provides anki object in context", async () => {
    const api = createMockAPI();

    const result = await executeSandbox(
      `
      const decks = await anki.decks.list();
      console.log(decks);
      `,
      api
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual([["Deck1", "Deck2"]]);
    expect(api.decks.list).toHaveBeenCalled();
  });

  it("can call multiple API methods", async () => {
    const api = createMockAPI();

    const result = await executeSandbox(
      `
      await anki.decks.create("Test");
      const id = await anki.notes.add({ deckName: "Test", modelName: "Basic", fields: {} });
      console.log({ id });
      `,
      api
    );

    expect(result.success).toBe(true);
    expect(result.output).toEqual([{ id: 123 }]);
    expect(api.decks.create).toHaveBeenCalledWith("Test");
  });
});

describe("formatSandboxResult", () => {
  it("formats success with output", () => {
    const formatted = formatSandboxResult({
      success: true,
      output: ["hello", { foo: "bar" }],
    });

    expect(formatted).toContain("hello");
    expect(formatted).toContain('"foo": "bar"');
  });

  it("formats success with no output", () => {
    const formatted = formatSandboxResult({
      success: true,
      output: [],
    });

    expect(formatted).toContain("Executed successfully");
  });

  it("formats error", () => {
    const formatted = formatSandboxResult({
      success: false,
      output: [],
      error: "Something went wrong",
    });

    expect(formatted).toContain("Error");
    expect(formatted).toContain("Something went wrong");
  });
});
