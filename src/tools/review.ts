// anki-review: Tool for AI-assisted review sessions

import type { AnkiClient } from "../anki-client";
import type { ReviewToolAPI, GuiCurrentCard } from "../types";
import { REVIEW_SESSION } from "../prompts";

export const TOOL_NAME = "anki-review";

export const TOOL_DESCRIPTION = `Control Anki's review interface for AI-assisted study sessions.

## Available APIs

### GUI Control
\`\`\`typescript
await anki.gui.browse(query)      // Open browser with query → noteIds[]
await anki.gui.currentCard()      // → card being reviewed or null
await anki.gui.showQuestion()     // Show question side
await anki.gui.showAnswer()       // Show answer side
await anki.gui.answerCard(ease)   // 1=Again 2=Hard 3=Good 4=Easy
await anki.gui.deckBrowser()      // Go to deck browser
await anki.gui.deckOverview(name) // Go to deck overview
await anki.gui.addCards()         // Open Add Cards dialog
await anki.gui.editNote(noteId)   // Open note editor
await anki.gui.selectCard(cardId) // Select card in browser → boolean
await anki.gui.selectedNotes()    // → noteIds of selection
await anki.gui.undo()             // Undo last action → description
\`\`\`

### Sync
\`\`\`typescript
await anki.sync()                 // Sync with AnkiWeb
\`\`\`

### Prompts
\`\`\`typescript
anki.prompts.reviewSession()      // → Review session guidelines
\`\`\`

## Examples

**Start a review session:**
\`\`\`typescript
const guidelines = anki.prompts.reviewSession();
console.log(guidelines);

await anki.gui.deckOverview("Spanish");
\`\`\`

**Get current card in review:**
\`\`\`typescript
const card = await anki.gui.currentCard();
if (card) {
  console.log({
    question: card.question,
    deck: card.deckName,
    buttons: card.buttons
  });
} else {
  console.log("No card being reviewed");
}
\`\`\`

**Answer a card:**
\`\`\`typescript
await anki.gui.showAnswer();
await anki.gui.answerCard(3); // 3 = Good
console.log("Answered");
\`\`\`

**Browse and select cards:**
\`\`\`typescript
await anki.gui.browse("deck:Spanish is:due");
const selected = await anki.gui.selectedNotes();
console.log({ selected: selected.length });
\`\`\`

**Sync after session:**
\`\`\`typescript
await anki.sync();
console.log("Synced with AnkiWeb");
\`\`\`

## Output
Use \`console.log()\` to return data. Only logged output is returned.
`;

export function buildAPI(client: AnkiClient): ReviewToolAPI {
  return {
    gui: {
      async browse(query: string) {
        return client.invoke<number[]>("guiBrowse", { query });
      },

      async currentCard() {
        try {
          return await client.invoke<GuiCurrentCard>("guiCurrentCard");
        } catch (error) {
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

    prompts: {
      reviewSession() {
        return REVIEW_SESSION;
      },
    },

    async sync() {
      await client.invoke("sync");
    },
  };
}
