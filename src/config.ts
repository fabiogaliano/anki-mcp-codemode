// Tool configuration from environment

export type ToolName = "create" | "manage" | "review" | "design";

const ALL_TOOLS: ToolName[] = ["create", "manage", "review", "design"];

export function getEnabledTools(): ToolName[] {
  const val = process.env.ANKI_TOOLS?.trim().toLowerCase() ?? "all";

  if (val === "all" || val === "") {
    return ALL_TOOLS;
  }

  const requested = val.split(",").map((s) => s.trim()) as ToolName[];
  const valid = requested.filter((t) => ALL_TOOLS.includes(t));

  if (valid.length === 0) {
    console.error(
      `Warning: No valid tools in ANKI_TOOLS="${val}". Valid options: ${ALL_TOOLS.join(", ")}. Enabling all tools.`
    );
    return ALL_TOOLS;
  }

  return valid;
}
