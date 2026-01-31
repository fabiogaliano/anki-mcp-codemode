#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { getAnkiClient } from "./anki-client";
import { getEnabledTools } from "./config";
import { registerTools } from "./tools";

const SERVER_NAME = "anki-mcp-codemode";
const SERVER_VERSION = "0.1.0";

async function main() {
  const client = getAnkiClient({
    url: process.env.ANKI_CONNECT_URL,
    apiKey: process.env.ANKI_CONNECT_API_KEY,
    timeout: parseInt(process.env.ANKI_CONNECT_TIMEOUT ?? "10000", 10),
  });

  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const enabledTools = getEnabledTools();
  registerTools(server, client, enabledTools);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(
    `${SERVER_NAME} v${SERVER_VERSION} running on stdio (tools: ${enabledTools.join(", ")})`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
