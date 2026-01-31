// anki-manage: Tool for managing existing cards, notes, and decks

import type { AnkiClient } from "../anki-client";
import type {
  ManageToolAPI,
  CardInfo,
  NoteInfo,
  DeckConfig,
  DeckStats,
} from "../types";

export const TOOL_NAME = "anki-manage";

export const TOOL_DESCRIPTION = `Manage existing Anki cards, notes, and decks.

## Available APIs

### Decks
\`\`\`typescript
await anki.decks.listWithIds()    // → Record<name, id>
await anki.decks.delete(name)     // → void
await anki.decks.getConfig(name)  // → DeckConfig
await anki.decks.getStats(name)   // → DeckStats
\`\`\`

### Cards
\`\`\`typescript
await anki.cards.find(query)      // → cardIds[] (Anki search syntax)
await anki.cards.getInfo(ids)     // → CardInfo[]
await anki.cards.getDue(deck?)    // → CardInfo[] (up to 100)
await anki.cards.suspend(ids)     // → void
await anki.cards.unsuspend(ids)   // → void
await anki.cards.areDue(ids)      // → boolean[]
\`\`\`

### Notes
\`\`\`typescript
await anki.notes.find(query)              // → noteIds[]
await anki.notes.getInfo(ids)             // → NoteInfo[]
await anki.notes.update(id, fields)       // → void
await anki.notes.delete(ids)              // → void
await anki.notes.addTags(ids, "tag1 tag2") // → void
await anki.notes.removeTags(ids, tags)    // → void
\`\`\`

### Tags
\`\`\`typescript
await anki.tags.list()                    // → string[]
await anki.tags.clearUnused()             // Remove unused tags
await anki.tags.replace(ids, old, new)    // Replace tag on notes
\`\`\`

## Examples

**Find and inspect cards:**
\`\`\`typescript
const noteIds = await anki.notes.find("deck:Spanish");
const notes = await anki.notes.getInfo(noteIds.slice(0, 10));
console.log(notes.map(n => ({ id: n.noteId, tags: n.tags })));
\`\`\`

**Update a note:**
\`\`\`typescript
await anki.notes.update(1234567890, {
  Front: "Updated question",
  Back: "Updated answer"
});
console.log("Updated");
\`\`\`

**Suspend cards:**
\`\`\`typescript
const cardIds = await anki.cards.find("deck:Spanish is:due");
await anki.cards.suspend(cardIds);
console.log({ suspended: cardIds.length });
\`\`\`

**Manage tags:**
\`\`\`typescript
const noteIds = await anki.notes.find("tag:old-tag");
await anki.tags.replace(noteIds, "old-tag", "new-tag");
console.log("Tags replaced");
\`\`\`

## Output
Use \`console.log()\` to return data. Only logged output is returned.
`;

export function buildAPI(client: AnkiClient): ManageToolAPI {
  return {
    decks: {
      async listWithIds() {
        return client.invoke<Record<string, number>>("deckNamesAndIds");
      },

      async delete(name: string) {
        await client.invoke("deleteDecks", { decks: [name], cardsToo: true });
      },

      async getConfig(name: string) {
        return client.invoke<DeckConfig>("getDeckConfig", { deck: name });
      },

      async getStats(name: string) {
        const stats = await client.invoke<Record<string, DeckStats>>(
          "getDeckStats",
          { decks: [name] }
        );
        return stats[name];
      },
    },

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
        return client.invoke<CardInfo[]>("cardsInfo", {
          cards: ids.slice(0, 100),
        });
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

    notes: {
      async find(query: string) {
        return client.invoke<number[]>("findNotes", { query });
      },

      async getInfo(ids: number[]) {
        return client.invoke<NoteInfo[]>("notesInfo", { notes: ids });
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
  };
}
