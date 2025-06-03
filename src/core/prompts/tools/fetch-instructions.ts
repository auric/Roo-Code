import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"

export interface FetchInstructionsParams {
	task: "create_mcp_server" | "create_mode"
}

export function getFetchInstructionsDescription(): string {
	return `## fetch_instructions
Description: Request to fetch instructions to perform a task
Parameters:
- task: (required) The task to get instructions for.  This can take the following values:
  create_mcp_server
  create_mode

Example: Requesting instructions to create an MCP Server

<fetch_instructions>
<task>create_mcp_server</task>
</fetch_instructions>`
}

export const fetchInstructionsNativeTool: vscode.LanguageModelChatTool = {
	name: "fetch_instructions" as ToolName,
	description:
		"Fetches predefined instructions for specific complex tasks like creating an MCP server or a new mode.",
	inputSchema: {
		type: "object",
		properties: {
			task: {
				type: "string",
				description: "The specific task for which to fetch instructions.",
				enum: ["create_mcp_server", "create_mode"],
			},
		},
		required: ["task"],
	},
}
