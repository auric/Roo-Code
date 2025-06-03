import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface UseMcpToolParams {
	server_name: string
	tool_name: string
	arguments: Record<string, any> // JSON object
}

export function getUseMcpToolDescription(args: ToolArgs): string | undefined {
	if (!args.mcpHub) {
		return undefined
	}
	return `## use_mcp_tool
Description: Request to use a tool provided by a connected MCP server. Each MCP server can provide multiple tools with different capabilities. Tools have defined input schemas that specify required and optional parameters.
Parameters:
- server_name: (required) The name of the MCP server providing the tool
- tool_name: (required) The name of the tool to execute
- arguments: (required) A JSON object containing the tool's input parameters, following the tool's input schema
Usage:
<use_mcp_tool>
<server_name>server name here</server_name>
<tool_name>tool name here</tool_name>
<arguments>
{
  "param1": "value1",
  "param2": "value2"
}
</arguments>
</use_mcp_tool>

Example: Requesting to use an MCP tool

<use_mcp_tool>
<server_name>weather-server</server_name>
<tool_name>get_forecast</tool_name>
<arguments>
{
  "city": "San Francisco",
  "days": 5
}
</arguments>
</use_mcp_tool>`
}

export const useMcpToolNativeTool: vscode.LanguageModelChatTool = {
	name: "use_mcp_tool" as ToolName,
	description: "Uses a tool provided by a connected MCP server, passing specified arguments.",
	// inputSchema is dynamic and will be enriched by the MCP Hub with actual server/tool schemas.
	// For the base definition, we define the core parameters.
	inputSchema: {
		type: "object",
		properties: {
			server_name: {
				type: "string",
				description: "The name of the MCP server providing the tool.",
			},
			tool_name: {
				type: "string",
				description: "The name of the tool to execute on the MCP server.",
			},
			arguments: {
				type: "object",
				description:
					"A JSON object containing the tool's input parameters, conforming to the specific tool's schema.",
				// It's not feasible to define a static schema for 'arguments' here,
				// as it depends on the 'tool_name' and 'server_name'.
				// The actual validation will happen server-side or via dynamic schema lookup.
				// For the VS Code API, we can mark it as a generic object.
				// Additional properties and specific required fields would be part of the dynamic schema.
				additionalProperties: true,
			},
		},
		required: ["server_name", "tool_name", "arguments"],
	},
}
