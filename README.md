# Anki MCP Server (Codemode)

An MCP server for AI-powered Anki interaction using a **codemode architecture** — the AI writes TypeScript code that executes against an injected `anki` API.

## Why Codemode?

Traditional MCP servers expose dozens of individual tools. This server takes a different approach:

| Traditional | Codemode |
|-------------|----------|
| 40+ discrete tools | 4 scoped tools |
| Fixed parameters | Full TypeScript flexibility |
| One operation per call | Compose multiple operations |
| Tool explosion as features grow | API grows, tools stay stable |

The AI writes code like `await anki.notes.add({...})` instead of invoking `addNote` with rigid parameters. This enables natural batching, error handling, and complex workflows in a single tool call.

## Tools Overview

| Tool | Purpose | Key APIs |
|------|---------|----------|
| `anki-create` | Add new content | `decks.create`, `notes.add`, `notes.addMany` |
| `anki-manage` | Work with existing | `notes.find`, `notes.update`, `notes.delete`, `cards.*`, `tags.*` |
| `anki-review` | Study sessions | `gui.*`, `sync`, `prompts.reviewSession` |
| `anki-design` | Customize templates | `models.create`, `models.styling`, `media.*`, `stats.*` |

## Prerequisites

- [Anki](https://apps.ankiweb.net) with [AnkiConnect](https://ankiweb.net/shared/info/2055492159) plugin
- [Bun](https://bun.sh) runtime

## Installation

```bash
git clone https://github.com/youruser/anki-mcp-codemode
cd anki-mcp-codemode
bun install
```

### Claude Desktop / MCP Clients

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "anki": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/anki-mcp-codemode/src/index.ts"],
      "env": {
        "ANKI_CONNECT_URL": "http://localhost:8765"
      }
    }
  }
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ANKI_TOOLS` | `all` | Tools to enable: `all` or comma-separated (`create,manage`) |
| `ANKI_CONNECT_URL` | `http://localhost:8765` | AnkiConnect URL |
| `ANKI_CONNECT_API_KEY` | — | API key (if configured in AnkiConnect) |
| `ANKI_CONNECT_TIMEOUT` | `10000` | Request timeout in ms |

### Selective Tool Loading

Only enable the tools you need:

```json
{
  "env": {
    "ANKI_TOOLS": "create,review"
  }
}
```

## Usage Examples

### Creating Cards

```typescript
// List available decks and models
const decks = await anki.decks.list();
const models = await anki.models.list();
console.log({ decks, models });

// Create a deck and add cards
await anki.decks.create("Spanish Vocabulary");

const noteId = await anki.notes.add({
  deckName: "Spanish Vocabulary",
  modelName: "Basic",
  fields: { Front: "Hola", Back: "Hello" },
  tags: ["greeting", "beginner"]
});

console.log({ created: noteId });
```

### Batch Operations

```typescript
// Add multiple cards efficiently
const vocab = [
  { front: "perro", back: "dog" },
  { front: "gato", back: "cat" },
  { front: "pájaro", back: "bird" },
];

const noteIds = await anki.notes.addMany(
  vocab.map(v => ({
    deckName: "Spanish Vocabulary",
    modelName: "Basic",
    fields: { Front: v.front, Back: v.back }
  }))
);

console.log({ added: noteIds.length });
```

### Study Session Prompts

```typescript
// Get the twenty rules prompt for effective card creation
const rules = anki.prompts.twentyRules();
console.log(rules);
```

## API Reference

See [docs/API.md](docs/API.md) for the complete API documentation for each tool.

## Development

```bash
bun install              # Install dependencies
bun run src/index.ts     # Run server
bun test                 # Run tests
bunx tsc --noEmit        # Type check
```

## How It Works

1. MCP client sends TypeScript code to one of the 4 tools
2. Server executes code in a sandbox with an injected `anki` object
3. The `anki` object provides type-safe methods that call AnkiConnect
4. `console.log()` output is captured and returned to the AI

```
┌─────────────┐     TypeScript      ┌─────────────┐     HTTP      ┌─────────────┐
│  AI Agent   │ ──── code ────────▶ │  MCP Server │ ────────────▶ │ AnkiConnect │
│  (Claude)   │ ◀─── console.log ── │    (Bun)    │ ◀──────────── │   (Anki)    │
└─────────────┘                     └─────────────┘               └─────────────┘
```

## Attribution

This project was inspired by and builds upon concepts from [@anthropics/anki-mcp-server](https://github.com/anthropics/anki-mcp-server) (formerly `anki-mcp-http`). While the implementation is a complete rewrite using a different architecture (Bun + codemode vs NestJS + discrete tools), credit goes to the original authors for pioneering Anki + MCP integration.

## License

[MIT](LICENSE) — Use freely, attribution appreciated.

### Third-Party Notices

- **Anki®** is a registered trademark of Ankitects Pty Ltd. This is an unofficial third-party tool.
- **Model Context Protocol (MCP)** is an open standard by Anthropic.
