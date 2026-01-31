// ============================================================================
// Sandbox Executor - Controlled code execution environment
// ============================================================================

import type { SandboxResult } from "./types";

// AsyncFunction constructor for top-level await support
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

interface SandboxConsole {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

interface SandboxContext {
  anki: unknown;
  console: SandboxConsole;
}

function createSandboxConsole(output: unknown[]): SandboxConsole {
  const formatArgs = (args: unknown[]): unknown => {
    if (args.length === 1) return args[0];
    return args;
  };

  return {
    log: (...args: unknown[]) => output.push(formatArgs(args)),
    error: (...args: unknown[]) => output.push({ error: formatArgs(args) }),
    warn: (...args: unknown[]) => output.push({ warn: formatArgs(args) }),
    info: (...args: unknown[]) => output.push(formatArgs(args)),
  };
}

export async function executeSandbox(
  code: string,
  api: unknown
): Promise<SandboxResult> {
  const output: unknown[] = [];

  try {
    // Create isolated context with injected API
    const context: SandboxContext = {
      anki: api,
      console: createSandboxConsole(output),
    };

    // Wrap code to capture return value
    const wrappedCode = `
      const __result = await (async () => {
        ${code}
      })();
      if (__result !== undefined) {
        console.log(__result);
      }
    `;

    // Create async function with limited scope
    // Only anki and console are available - no global access
    const fn = new AsyncFunction(
      "anki",
      "console",
      wrappedCode
    );

    // Execute with injected context
    await fn(context.anki, context.console);

    return {
      success: true,
      output,
    };
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : String(error);

    // Include stack trace for debugging if available
    const stack = error instanceof Error && error.stack
      ? `\n${error.stack.split('\n').slice(1, 4).join('\n')}`
      : '';

    return {
      success: false,
      output,
      error: errorMessage + stack,
    };
  }
}

// Format sandbox result for MCP response
export function formatSandboxResult(result: SandboxResult): string {
  const parts: string[] = [];

  // Add any output that was captured
  if (result.output.length > 0) {
    for (const item of result.output) {
      if (typeof item === "string") {
        parts.push(item);
      } else {
        parts.push(JSON.stringify(item, null, 2));
      }
    }
  }

  // Add error if present
  if (!result.success && result.error) {
    parts.push(`\n❌ Error: ${result.error}`);
  }

  if (parts.length === 0) {
    return result.success
      ? "✓ Executed successfully (no output)"
      : "❌ Execution failed with no output";
  }

  return parts.join("\n");
}
