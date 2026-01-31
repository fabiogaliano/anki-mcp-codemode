# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

MCP server with 4 scoped tools for AI-powered Anki interaction. Built with Bun.

- **Package**: `@anki/mcp-codemode`
- **License**: MIT
- **Runtime**: Bun (not Node.js)

## Quick Reference

```bash
# Run
bun run src/index.ts              # Start MCP server (all tools)
ANKI_TOOLS=create bun run src/index.ts  # Start with specific tool(s)

# Dev
bun install                       # Install deps
bun run --watch src/index.ts      # Dev mode with watch

# Quality
bun test                          # Run tests
bunx tsc --noEmit                 # Type check
```

## Architecture

Four scoped tools instead of one monolithic execute tool. Each tool has a focused API surface:

| Tool | Intent | Key Methods |
|------|--------|-------------|
| `anki-create` | Add new cards | decks.list/create, models.list/getFields, notes.add/addMany |
| `anki-manage` | Work with existing | notes.find/update/delete, cards.*, tags.* |
| `anki-review` | AI-assisted study | gui.*, prompts.reviewSession, sync |
| `anki-design` | Customize templates | models.create/styling, media.*, stats.* |

```
src/
├── index.ts       # MCP server entry point
├── config.ts      # ANKI_TOOLS env parsing
├── sandbox.ts     # Code execution sandbox
├── anki-api.ts    # Full Anki API (used by legacy code/tests)
├── anki-client.ts # AnkiConnect HTTP client
├── types.ts       # TypeScript types (includes partial API interfaces)
├── prompts.ts     # Prompt templates
└── tools/
    ├── index.ts   # Tool registry + registerTools()
    ├── create.ts  # anki-create tool
    ├── manage.ts  # anki-manage tool
    ├── review.ts  # anki-review tool
    └── design.ts  # anki-design tool
```

### How It Works

1. `config.ts` reads `ANKI_TOOLS` env var to determine enabled tools
2. `tools/index.ts` registers enabled tools with the MCP server
3. Each tool builds a partial API with only relevant methods
4. AI sends TypeScript code to a tool
5. `sandbox.ts` executes code with injected `anki` object
6. `console.log()` output is returned to AI

### Tool Selection

Configure via `ANKI_TOOLS` environment variable:
- `all` (default) - Enable all tools
- Comma-separated: `create,manage` - Enable specific tools

## Adding New API Methods

1. Add method to appropriate namespace in `src/anki-api.ts`
2. Add to partial API interface in `src/types.ts` (e.g., `CreateToolAPI`)
3. Add to tool's `buildAPI()` function in `src/tools/*.ts`
4. Update tool description in the same file
5. Add types to `src/types.ts` if needed

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `ANKI_TOOLS` | `all` | Which tools to enable |
| `ANKI_CONNECT_URL` | `http://localhost:8765` | AnkiConnect URL |
| `ANKI_CONNECT_API_KEY` | - | API key if configured |
| `ANKI_CONNECT_TIMEOUT` | `10000` | Request timeout (ms) |
