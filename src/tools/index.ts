// Tool registry - registers enabled tools with the MCP server

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import type { AnkiClient } from "../anki-client";
import type { ToolName } from "../config";
import { executeSandbox, formatSandboxResult } from "../sandbox";

import * as createTool from "./create";
import * as manageTool from "./manage";
import * as reviewTool from "./review";
import * as designTool from "./design";

interface ToolModule {
  TOOL_NAME: string;
  TOOL_DESCRIPTION: string;
  buildAPI: (client: AnkiClient) => unknown;
}

const TOOL_MAP: Record<ToolName, ToolModule> = {
  create: createTool,
  manage: manageTool,
  review: reviewTool,
  design: designTool,
};

function registerTool(
  server: McpServer,
  client: AnkiClient,
  tool: ToolModule
): void {
  server.registerTool(
    tool.TOOL_NAME,
    {
      description: tool.TOOL_DESCRIPTION,
      inputSchema: {
        code: z.string().describe("TypeScript code to execute"),
      },
    },
    async ({ code }) => {
      const api = tool.buildAPI(client);
      const result = await executeSandbox(code, api);
      const formattedOutput = formatSandboxResult(result);

      return {
        content: [{ type: "text", text: formattedOutput }],
        isError: !result.success,
      };
    }
  );
}

export function registerTools(
  server: McpServer,
  client: AnkiClient,
  enabledTools: ToolName[]
): void {
  for (const toolName of enabledTools) {
    const toolModule = TOOL_MAP[toolName];
    if (toolModule) {
      registerTool(server, client, toolModule);
    }
  }
}
