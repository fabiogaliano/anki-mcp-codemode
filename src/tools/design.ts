// anki-design: Tool for customizing note types and templates

import type { AnkiClient } from "../anki-client";
import type {
  DesignToolAPI,
  CreateModelInput,
  ModelStyling,
  CollectionStats,
  DeckStats,
} from "../types";

export const TOOL_NAME = "anki-design";

export const TOOL_DESCRIPTION = `Customize Anki note types, templates, and media.

## Available APIs

### Models (Note Types)
\`\`\`typescript
await anki.models.list()              // → string[]
await anki.models.listWithIds()       // → Record<name, id>
await anki.models.getFields(name)     // → string[]
await anki.models.getStyling(name)    // → { css }
await anki.models.create({ modelName, inOrderFields, cardTemplates, css? })
await anki.models.updateStyling(name, css)
\`\`\`

### Media
\`\`\`typescript
await anki.media.store(filename, base64)  // → storedName
await anki.media.retrieve(filename)       // → base64
await anki.media.list(pattern?)           // → string[]
await anki.media.delete(filename)         // → void
\`\`\`

### Stats
\`\`\`typescript
await anki.stats.collection()         // → { deckCount, noteCount, cardCount }
await anki.stats.decks()              // → Record<deckName, DeckStats>
await anki.stats.reviews(days?)       // → { reviews, days } last N days
\`\`\`

## Examples

**Create a custom note type:**
\`\`\`typescript
await anki.models.create({
  modelName: "Vocabulary",
  inOrderFields: ["Word", "Definition", "Example"],
  cardTemplates: [{
    Name: "Card 1",
    Front: "{{Word}}",
    Back: "{{Definition}}<br><br><i>{{Example}}</i>"
  }],
  css: ".card { font-family: Georgia; font-size: 20px; }"
});
console.log("Model created");
\`\`\`

**Update model styling:**
\`\`\`typescript
const currentStyle = await anki.models.getStyling("Basic");
console.log("Current CSS:", currentStyle.css);

await anki.models.updateStyling("Basic", \`
  .card { font-family: Georgia; font-size: 22px; }
  .night_mode .card { background: #1a1a1a; }
\`);
console.log("Styling updated");
\`\`\`

**Store media:**
\`\`\`typescript
const base64Audio = "..."; // base64-encoded file
const filename = await anki.media.store("pronunciation.mp3", base64Audio);
console.log({ stored: filename });
\`\`\`

**Get collection stats:**
\`\`\`typescript
const stats = await anki.stats.collection();
console.log(stats);

const reviews = await anki.stats.reviews(7);
console.log(\`Last 7 days: \${reviews.reviews} reviews\`);
\`\`\`

## Output
Use \`console.log()\` to return data. Only logged output is returned.
`;

export function buildAPI(client: AnkiClient): DesignToolAPI {
  return {
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

    stats: {
      async collection() {
        const [deckCount, noteCount, cardCount] = await Promise.all([
          client.invoke<string[]>("deckNames").then((d) => d.length),
          client
            .invoke<number[]>("findNotes", { query: "*" })
            .then((n) => n.length),
          client
            .invoke<number[]>("findCards", { query: "*" })
            .then((c) => c.length),
        ]);

        return {
          deckCount,
          noteCount,
          cardCount,
          reviewCount: 0,
        } satisfies CollectionStats;
      },

      async decks() {
        const names = await client.invoke<string[]>("deckNames");
        return client.invoke<Record<string, DeckStats>>("getDeckStats", {
          decks: names,
        });
      },

      async reviews(days = 30) {
        const stats = await client.invoke<
          [[number, number, number, number, number, number]]
        >("getNumCardsReviewedByDay");
        const recent = stats.slice(0, days);
        return {
          days,
          reviews: recent.reduce((sum, [, count]) => sum + count, 0),
          time: 0,
          failed: 0,
          young: 0,
          mature: 0,
        };
      },
    },
  };
}
