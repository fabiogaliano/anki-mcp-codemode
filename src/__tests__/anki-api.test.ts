import { describe, expect, it, mock } from "bun:test";
import { createAnkiAPI } from "../anki-api";
import type { AnkiClient } from "../anki-client";

function createMockClient() {
  return {
    invoke: mock(() => Promise.resolve(null)),
    multi: mock(() => Promise.resolve([])),
  } as unknown as AnkiClient;
}

describe("createAnkiAPI", () => {
  describe("prompts", () => {
    it("twentyRules returns card creation guidelines", () => {
      const client = createMockClient();
      const api = createAnkiAPI(client);

      const rules = api.prompts.twentyRules();

      expect(rules).toContain("Twenty Rules");
      expect(rules).toContain("Minimum Information");
      expect(rules).toContain("Cloze");
    });

    it("reviewSession returns review guidelines", () => {
      const client = createMockClient();
      const api = createAnkiAPI(client);

      const guidelines = api.prompts.reviewSession();

      expect(guidelines).toContain("Review Session");
      expect(guidelines).toContain("Sync");
      expect(guidelines).toContain("Never auto-rate");
    });
  });

  describe("tags", () => {
    it("replace calls replaceTags with correct params", async () => {
      const client = createMockClient();
      const api = createAnkiAPI(client);

      await api.tags.replace([1, 2, 3], "old-tag", "new-tag");

      expect(client.invoke).toHaveBeenCalledWith("replaceTags", {
        notes: [1, 2, 3],
        tag_to_replace: "old-tag",
        replace_with_tag: "new-tag",
      });
    });

    it("clearUnused calls clearUnusedTags", async () => {
      const client = createMockClient();
      const api = createAnkiAPI(client);

      await api.tags.clearUnused();

      expect(client.invoke).toHaveBeenCalledWith("clearUnusedTags");
    });
  });

  describe("stats", () => {
    it("reviews aggregates data from getNumCardsReviewedByDay", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce([
        [0, 10, 0, 0, 0, 0],
        [1, 15, 0, 0, 0, 0],
        [2, 20, 0, 0, 0, 0],
      ]);

      const api = createAnkiAPI(client);
      const result = await api.stats.reviews(3);

      expect(result.days).toBe(3);
      expect(result.reviews).toBe(45); // 10 + 15 + 20
    });

    it("reviews defaults to 30 days", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce([]);

      const api = createAnkiAPI(client);
      const result = await api.stats.reviews();

      expect(result.days).toBe(30);
    });
  });

  describe("gui", () => {
    it("selectCard calls guiSelectNote", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce(true);

      const api = createAnkiAPI(client);
      const result = await api.gui.selectCard(12345);

      expect(client.invoke).toHaveBeenCalledWith("guiSelectNote", { card: 12345 });
      expect(result).toBe(true);
    });

    it("selectedNotes calls guiSelectedNotes", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce([1, 2, 3]);

      const api = createAnkiAPI(client);
      const result = await api.gui.selectedNotes();

      expect(client.invoke).toHaveBeenCalledWith("guiSelectedNotes");
      expect(result).toEqual([1, 2, 3]);
    });

    it("undo calls guiUndo and returns description", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce("Undo Add Note");

      const api = createAnkiAPI(client);
      const result = await api.gui.undo();

      expect(client.invoke).toHaveBeenCalledWith("guiUndo");
      expect(result).toBe("Undo Add Note");
    });

    it("currentCard returns null on review-related errors", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error("not currently reviewing")
      );

      const api = createAnkiAPI(client);
      const result = await api.gui.currentCard();

      expect(result).toBeNull();
    });

    it("currentCard rethrows non-review errors", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockRejectedValueOnce(
        new Error("network timeout")
      );

      const api = createAnkiAPI(client);

      await expect(api.gui.currentCard()).rejects.toThrow("network timeout");
    });
  });

  describe("decks", () => {
    it("list calls deckNames", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce(["Deck1", "Deck2"]);

      const api = createAnkiAPI(client);
      const result = await api.decks.list();

      expect(client.invoke).toHaveBeenCalledWith("deckNames");
      expect(result).toEqual(["Deck1", "Deck2"]);
    });

    it("create calls createDeck with deck name", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce(123);

      const api = createAnkiAPI(client);
      const result = await api.decks.create("NewDeck");

      expect(client.invoke).toHaveBeenCalledWith("createDeck", { deck: "NewDeck" });
      expect(result).toBe(123);
    });
  });

  describe("notes", () => {
    it("add formats note correctly", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce(456);

      const api = createAnkiAPI(client);
      const result = await api.notes.add({
        deckName: "Test",
        modelName: "Basic",
        fields: { Front: "Q", Back: "A" },
        tags: ["tag1"],
      });

      expect(client.invoke).toHaveBeenCalledWith("addNote", {
        note: {
          deckName: "Test",
          modelName: "Basic",
          fields: { Front: "Q", Back: "A" },
          tags: ["tag1"],
          options: { allowDuplicate: false },
        },
      });
      expect(result).toBe(456);
    });

    it("addMany handles multiple notes", async () => {
      const client = createMockClient();
      (client.invoke as ReturnType<typeof mock>).mockResolvedValueOnce([1, 2]);

      const api = createAnkiAPI(client);
      const result = await api.notes.addMany([
        { deckName: "Test", modelName: "Basic", fields: { Front: "Q1", Back: "A1" } },
        { deckName: "Test", modelName: "Basic", fields: { Front: "Q2", Back: "A2" } },
      ]);

      expect(client.invoke).toHaveBeenCalledWith("addNotes", expect.any(Object));
      expect(result).toEqual([1, 2]);
    });
  });
});
