// ============================================================================
// Anki API - Typed wrapper for sandbox injection
// ============================================================================

import type { AnkiClient } from "./anki-client";
import type {
  AnkiAPI,
  AddNoteInput,
  CardInfo,
  CollectionStats,
  CreateModelInput,
  DeckConfig,
  DeckStats,
  GuiCurrentCard,
  ModelStyling,
  NoteInfo,
} from "./types";
import { TWENTY_RULES, REVIEW_SESSION } from "./prompts";

export function createAnkiAPI(client: AnkiClient): AnkiAPI {
  return {
    // ========================================================================
    // DECKS
    // ========================================================================
    decks: {
      async list() {
        return client.invoke<string[]>("deckNames");
      },

      async listWithIds() {
        return client.invoke<Record<string, number>>("deckNamesAndIds");
      },

      async create(name: string) {
        return client.invoke<number>("createDeck", { deck: name });
      },

      async delete(name: string) {
        await client.invoke("deleteDecks", { decks: [name], cardsToo: true });
      },

      async getConfig(name: string) {
        return client.invoke<DeckConfig>("getDeckConfig", { deck: name });
      },

      async getStats(name: string) {
        const stats = await client.invoke<Record<string, DeckStats>>("getDeckStats", {
          decks: [name],
        });
        return stats[name];
      },
    },

    // ========================================================================
    // CARDS
    // ========================================================================
    cards: {
      async find(query: string) {
        return client.invoke<number[]>("findCards", { query });
      },

      async getInfo(ids: number[]) {
        return client.invoke<CardInfo[]>("cardsInfo", { cards: ids });
      },

      async getDue(deckName?: string) {
        const query = deckName ? `deck:"${deckName}" is:due` : "is:due";
        const ids = await client.invoke<number[]>("findCards", { query });
        if (ids.length === 0) return [];
        return client.invoke<CardInfo[]>("cardsInfo", { cards: ids.slice(0, 100) });
      },

      async suspend(ids: number[]) {
        await client.invoke("suspend", { cards: ids });
      },

      async unsuspend(ids: number[]) {
        await client.invoke("unsuspend", { cards: ids });
      },

      async areDue(ids: number[]) {
        return client.invoke<boolean[]>("areDue", { cards: ids });
      },
    },

    // ========================================================================
    // NOTES
    // ========================================================================
    notes: {
      async find(query: string) {
        return client.invoke<number[]>("findNotes", { query });
      },

      async getInfo(ids: number[]) {
        return client.invoke<NoteInfo[]>("notesInfo", { notes: ids });
      },

      async add(note: AddNoteInput) {
        return client.invoke<number>("addNote", {
          note: {
            deckName: note.deckName,
            modelName: note.modelName,
            fields: note.fields,
            tags: note.tags ?? [],
            options: note.options ?? { allowDuplicate: false },
          },
        });
      },

      async addMany(notes: AddNoteInput[]) {
        return client.invoke<number[]>("addNotes", {
          notes: notes.map((n) => ({
            deckName: n.deckName,
            modelName: n.modelName,
            fields: n.fields,
            tags: n.tags ?? [],
            options: n.options ?? { allowDuplicate: false },
          })),
        });
      },

      async update(id: number, fields: Record<string, string>) {
        await client.invoke("updateNoteFields", { note: { id, fields } });
      },

      async delete(ids: number[]) {
        await client.invoke("deleteNotes", { notes: ids });
      },

      async addTags(ids: number[], tags: string) {
        await client.invoke("addTags", { notes: ids, tags });
      },

      async removeTags(ids: number[], tags: string) {
        await client.invoke("removeTags", { notes: ids, tags });
      },
    },

    // ========================================================================
    // MODELS
    // ========================================================================
    models: {
      async list() {
        return client.invoke<string[]>("modelNames");
      },

      async listWithIds() {
        return client.invoke<Record<string, number>>("modelNamesAndIds");
      },

      async getFields(name: string) {
        return client.invoke<string[]>("modelFieldNames", { modelName: name });
      },

      async getStyling(name: string) {
        return client.invoke<ModelStyling>("modelStyling", { modelName: name });
      },

      async create(model: CreateModelInput) {
        await client.invoke("createModel", { ...model });
      },

      async updateStyling(name: string, css: string) {
        await client.invoke("updateModelStyling", { model: { name, css } });
      },
    },

    // ========================================================================
    // TAGS
    // ========================================================================
    tags: {
      async list() {
        return client.invoke<string[]>("getTags");
      },

      async clearUnused() {
        await client.invoke("clearUnusedTags");
      },

      async replace(ids: number[], oldTag: string, newTag: string) {
        await client.invoke("replaceTags", {
          notes: ids,
          tag_to_replace: oldTag,
          replace_with_tag: newTag,
        });
      },
    },

    // ========================================================================
    // MEDIA
    // ========================================================================
    media: {
      async store(filename: string, base64: string) {
        return client.invoke<string>("storeMediaFile", {
          filename,
          data: base64,
        });
      },

      async retrieve(filename: string) {
        return client.invoke<string>("retrieveMediaFile", { filename });
      },

      async list(pattern?: string) {
        return client.invoke<string[]>("getMediaFilesNames", {
          pattern: pattern ?? "*",
        });
      },

      async delete(filename: string) {
        await client.invoke("deleteMediaFile", { filename });
      },
    },

    // ========================================================================
    // STATS
    // ========================================================================
    stats: {
      async collection() {
        const [deckCount, noteCount, cardCount] = await Promise.all([
          client.invoke<string[]>("deckNames").then((d) => d.length),
          client.invoke<number[]>("findNotes", { query: "*" }).then((n) => n.length),
          client.invoke<number[]>("findCards", { query: "*" }).then((c) => c.length),
        ]);

        return {
          deckCount,
          noteCount,
          cardCount,
          reviewCount: 0, // Would need additional API
        } satisfies CollectionStats;
      },

      async decks() {
        const names = await client.invoke<string[]>("deckNames");
        return client.invoke<Record<string, DeckStats>>("getDeckStats", {
          decks: names,
        });
      },

      async reviews(days = 30) {
        const stats = await client.invoke<[[number, number, number, number, number, number]]>(
          "getNumCardsReviewedByDay"
        );
        // Stats is array of [day_offset, total, ...] - aggregate last N days
        const recent = stats.slice(0, days);
        return {
          days,
          reviews: recent.reduce((sum, [, count]) => sum + count, 0),
          time: 0, // Not available from this endpoint
          failed: 0,
          young: 0,
          mature: 0,
        };
      },
    },

    // ========================================================================
    // PROMPTS
    // ========================================================================
    prompts: {
      twentyRules() {
        return TWENTY_RULES;
      },

      reviewSession() {
        return REVIEW_SESSION;
      },
    },

    // ========================================================================
    // GLOBAL ACTIONS
    // ========================================================================
    async sync() {
      await client.invoke("sync");
    },

    // ========================================================================
    // GUI
    // ========================================================================
    gui: {
      async browse(query: string) {
        return client.invoke<number[]>("guiBrowse", { query });
      },

      async currentCard() {
        try {
          return await client.invoke<GuiCurrentCard>("guiCurrentCard");
        } catch (error) {
          // Return null only when no card is being reviewed, rethrow real errors
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes("review") || msg.includes("card")) {
            return null;
          }
          throw error;
        }
      },

      async showQuestion() {
        await client.invoke("guiShowQuestion");
      },

      async showAnswer() {
        await client.invoke("guiShowAnswer");
      },

      async answerCard(ease: 1 | 2 | 3 | 4) {
        await client.invoke("guiAnswerCard", { ease });
      },

      async deckBrowser() {
        await client.invoke("guiDeckBrowser");
      },

      async deckOverview(name: string) {
        await client.invoke("guiDeckOverview", { name });
      },

      async addCards() {
        await client.invoke("guiAddCards");
      },

      async editNote(noteId: number) {
        await client.invoke("guiEditNote", { note: noteId });
      },

      async selectCard(cardId: number) {
        return client.invoke<boolean>("guiSelectNote", { card: cardId });
      },

      async selectedNotes() {
        return client.invoke<number[]>("guiSelectedNotes");
      },

      async undo() {
        return client.invoke<string>("guiUndo");
      },
    },
  };
}
