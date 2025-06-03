import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface AccessMcpResourceParams {
	server_name: string
	uri: string
}

export function getAccessMcpResourceDescription(args: ToolArgs): string | undefined {
	if (!args.mcpHub) {
		return undefined
	}
	return `## access_mcp_resource
Description: Request to access a resource provided by a connected MCP server. Resources represent data sources that can be used as context, such as files, API responses, or system information.
Parameters:
- server_name: (required) The name of the MCP server providing the resource
- uri: (required) The URI identifying the specific resource to access
Usage:
<access_mcp_resource>
<server_name>server name here</server_name>
<uri>resource URI here</uri>
</access_mcp_resource>

Example: Requesting to access an MCP resource

<access_mcp_resource>
<server_name>weather-server</server_name>
<uri>weather://san-francisco/current</uri>
</access_mcp_resource>`
}

export const accessMcpResourceNativeTool: vscode.LanguageModelChatTool = {
	name: "access_mcp_resource" as ToolName,
	description: "Accesses a named resource from a connected MCP server.",
	inputSchema: {
		type: "object",
		properties: {
			server_name: {
				type: "string",
				description: "The name of the MCP server providing the resource.",
			},
			uri: {
				type: "string",
				description: "The URI identifying the specific resource to access.",
			},
		},
		required: ["server_name", "uri"],
	},
}
