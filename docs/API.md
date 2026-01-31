# API Reference

Complete API documentation for each tool.

## anki-create

APIs for adding new cards to Anki.

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.decks.list()` | `string[]` | List deck names |
| `anki.decks.create(name)` | `number` | Create deck, returns ID |
| `anki.models.list()` | `string[]` | List note type names |
| `anki.models.getFields(name)` | `string[]` | Get field names for a note type |
| `anki.notes.add({...})` | `number` | Add note, returns ID |
| `anki.notes.addMany([...])` | `number[]` | Batch add notes |
| `anki.prompts.twentyRules()` | `string` | Card creation best practices |

### notes.add() Parameters

```typescript
await anki.notes.add({
  deckName: "Deck Name",        // Required
  modelName: "Basic",           // Required - note type
  fields: {                     // Required - field values
    Front: "Question",
    Back: "Answer"
  },
  tags: ["tag1", "tag2"],       // Optional
  options: {                    // Optional
    allowDuplicate: false,
    duplicateScope: "deck"
  }
});
```

---

## anki-manage

APIs for working with existing cards.

### Decks

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.decks.listWithIds()` | `Record<string, number>` | Decks with IDs |
| `anki.decks.delete(name)` | `void` | Delete a deck |
| `anki.decks.getConfig(name)` | `DeckConfig` | Get deck settings |
| `anki.decks.getStats(name)` | `DeckStats` | Get deck statistics |

### Cards

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.cards.find(query)` | `number[]` | Search cards using [Anki search syntax](https://docs.ankiweb.net/searching.html) |
| `anki.cards.getInfo(ids)` | `CardInfo[]` | Get card details |
| `anki.cards.getDue(deck?)` | `CardInfo[]` | Get due cards (max 100) |
| `anki.cards.suspend(ids)` | `void` | Suspend cards |
| `anki.cards.unsuspend(ids)` | `void` | Unsuspend cards |
| `anki.cards.areDue(ids)` | `boolean[]` | Check if cards are due |

### Notes

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.notes.find(query)` | `number[]` | Search notes |
| `anki.notes.getInfo(ids)` | `NoteInfo[]` | Get note details |
| `anki.notes.update(id, fields)` | `void` | Update note fields |
| `anki.notes.delete(ids)` | `void` | Delete notes |
| `anki.notes.addTags(ids, tags)` | `void` | Add tags (space-separated) |
| `anki.notes.removeTags(ids, tags)` | `void` | Remove tags |

### Tags

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.tags.list()` | `string[]` | List all tags |
| `anki.tags.clearUnused()` | `void` | Remove unused tags |
| `anki.tags.replace(ids, old, new)` | `void` | Rename tag on notes |

### Search Query Examples

```typescript
// Basic searches
await anki.notes.find("deck:Spanish");           // Notes in deck
await anki.notes.find("tag:verb");               // Notes with tag
await anki.notes.find("front:hello");            // Field contains text

// Card state
await anki.cards.find("is:due");                 // Due for review
await anki.cards.find("is:new");                 // New cards
await anki.cards.find("is:suspended");           // Suspended

// Combining
await anki.notes.find("deck:Spanish tag:verb");  // AND
await anki.notes.find("deck:Spanish OR deck:French"); // OR
```

---

## anki-review

APIs for AI-assisted review sessions.

### GUI Control

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.gui.browse(query)` | `number[]` | Open browser with search |
| `anki.gui.currentCard()` | `GuiCurrentCard \| null` | Get current review card |
| `anki.gui.showQuestion()` | `void` | Show question side |
| `anki.gui.showAnswer()` | `void` | Show answer side |
| `anki.gui.answerCard(ease)` | `void` | Answer card |
| `anki.gui.deckBrowser()` | `void` | Go to deck list |
| `anki.gui.deckOverview(name)` | `void` | Go to deck overview |
| `anki.gui.addCards()` | `void` | Open Add Cards dialog |
| `anki.gui.editNote(noteId)` | `void` | Open note editor |
| `anki.gui.selectCard(cardId)` | `boolean` | Select card in browser |
| `anki.gui.selectedNotes()` | `number[]` | Get selected note IDs |
| `anki.gui.undo()` | `string` | Undo last action |

### Answer Ease Values

| Value | Button | When to use |
|-------|--------|-------------|
| `1` | Again | Forgot / wrong |
| `2` | Hard | Correct but difficult |
| `3` | Good | Correct with normal effort |
| `4` | Easy | Correct with no effort |

### Other

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.prompts.reviewSession()` | `string` | Review session guidelines |
| `anki.sync()` | `void` | Sync with AnkiWeb |

---

## anki-design

APIs for customizing note types and templates.

### Models (Note Types)

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.models.list()` | `string[]` | List note types |
| `anki.models.listWithIds()` | `Record<string, number>` | Note types with IDs |
| `anki.models.getFields(name)` | `string[]` | Get fields |
| `anki.models.getStyling(name)` | `{ css }` | Get CSS styling |
| `anki.models.create({...})` | `void` | Create note type |
| `anki.models.updateStyling(name, css)` | `void` | Update CSS |

### models.create() Parameters

```typescript
await anki.models.create({
  modelName: "My Note Type",    // Required
  inOrderFields: [              // Required - field names
    "Front",
    "Back",
    "Extra"
  ],
  cardTemplates: [{             // Required - at least one
    Name: "Card 1",
    Front: "{{Front}}",
    Back: "{{FrontSide}}<hr>{{Back}}"
  }],
  css: ".card { font-size: 20px; }"  // Optional
});
```

### Media

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.media.store(filename, base64)` | `string` | Store media file |
| `anki.media.retrieve(filename)` | `string` | Get media as base64 |
| `anki.media.list(pattern?)` | `string[]` | List media files |
| `anki.media.delete(filename)` | `void` | Delete media file |

### Stats

| Method | Returns | Description |
|--------|---------|-------------|
| `anki.stats.collection()` | `CollectionStats` | Collection overview |
| `anki.stats.decks()` | `Record<string, DeckStats>` | All deck stats |
| `anki.stats.reviews(days?)` | `ReviewStats` | Review history (default: 30 days) |

---

## Types

### CardInfo

```typescript
interface CardInfo {
  cardId: number;
  noteId: number;
  deckName: string;
  modelName: string;
  question: string;
  answer: string;
  fields: Record<string, { value: string; order: number }>;
  due: number;
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
}
```

### NoteInfo

```typescript
interface NoteInfo {
  noteId: number;
  modelName: string;
  tags: string[];
  fields: Record<string, { value: string; order: number }>;
}
```

### DeckStats

```typescript
interface DeckStats {
  deckId: number;
  name: string;
  newCount: number;
  learnCount: number;
  reviewCount: number;
  totalInDeck: number;
}
```

### GuiCurrentCard

```typescript
interface GuiCurrentCard {
  cardId: number;
  noteId: number;
  question: string;
  answer: string;
  deckName: string;
  modelName: string;
  buttons: number[];  // Available ease buttons
}
```
