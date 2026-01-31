// anki-create: Tool for adding new cards to Anki

import type { AnkiClient } from "../anki-client";
import type { CreateToolAPI, AddNoteInput } from "../types";
import { TWENTY_RULES } from "../prompts";

export const TOOL_NAME = "anki-create";

export const TOOL_DESCRIPTION = `Create new Anki cards and decks.

## Available APIs

### Decks
\`\`\`typescript
await anki.decks.list()           // → string[] (existing decks)
await anki.decks.create(name)     // → deckId (create new deck)
\`\`\`

### Models (Note Types)
\`\`\`typescript
await anki.models.list()          // → string[] (available note types)
await anki.models.getFields(name) // → string[] (field names for a model)
\`\`\`

### Notes (Cards)
\`\`\`typescript
await anki.notes.add({ deckName, modelName, fields, tags? })  // → noteId
await anki.notes.addMany([...])   // → noteIds[] (batch add)
\`\`\`

### Prompts
\`\`\`typescript
anki.prompts.twentyRules()        // → Card creation best practices
\`\`\`

## Examples

**List decks and models:**
\`\`\`typescript
const decks = await anki.decks.list();
const models = await anki.models.list();
console.log({ decks, models });
\`\`\`

**Check model fields:**
\`\`\`typescript
const fields = await anki.models.getFields("Basic");
console.log(fields); // ["Front", "Back"]
\`\`\`

**Add a single card:**
\`\`\`typescript
const id = await anki.notes.add({
  deckName: "Spanish",
  modelName: "Basic",
  fields: { Front: "Hola", Back: "Hello" },
  tags: ["greeting"]
});
console.log({ created: id });
\`\`\`

**Batch add cards:**
\`\`\`typescript
const vocab = [
  { front: "perro", back: "dog" },
  { front: "gato", back: "cat" },
];

const ids = await anki.notes.addMany(
  vocab.map(v => ({
    deckName: "Spanish",
    modelName: "Basic",
    fields: { Front: v.front, Back: v.back }
  }))
);
console.log({ added: ids.length });
\`\`\`

## Output
Use \`console.log()\` to return data. Only logged output is returned.
`;

export function buildAPI(client: AnkiClient): CreateToolAPI {
  return {
    decks: {
      async list() {
        return client.invoke<string[]>("deckNames");
      },
      async create(name: string) {
        return client.invoke<number>("createDeck", { deck: name });
      },
    },

    models: {
      async list() {
        return client.invoke<string[]>("modelNames");
      },
      async getFields(name: string) {
        return client.invoke<string[]>("modelFieldNames", { modelName: name });
      },
    },

    notes: {
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
    },

    prompts: {
      twentyRules() {
        return TWENTY_RULES;
      },
    },
  };
}
