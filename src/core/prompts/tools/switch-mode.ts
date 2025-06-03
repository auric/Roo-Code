import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"

export interface SwitchModeParams {
	mode_slug: string
	reason?: string
}

export function getSwitchModeDescription(): string {
	return `## switch_mode
Description: Request to switch to a different mode. This tool allows modes to request switching to another mode when needed, such as switching to Code mode to make code changes. The user must approve the mode switch.
Parameters:
- mode_slug: (required) The slug of the mode to switch to (e.g., "code", "ask", "architect")
- reason: (optional) The reason for switching modes
Usage:
<switch_mode>
<mode_slug>Mode slug here</mode_slug>
<reason>Reason for switching here</reason>
</switch_mode>

Example: Requesting to switch to code mode
<switch_mode>
<mode_slug>code</mode_slug>
<reason>Need to make code changes</reason>
</switch_mode>`
}

export const switchModeNativeTool: vscode.LanguageModelChatTool = {
	name: "switch_mode" as ToolName,
	description: "Requests to switch to a different operational mode, with an optional reason.",
	inputSchema: {
		type: "object",
		properties: {
			mode_slug: {
				type: "string",
				description: "The slug of the mode to switch to (e.g., 'code', 'ask').",
			},
			reason: {
				type: "string",
				description: "Optional reason for switching modes.",
			},
		},
		required: ["mode_slug"],
	},
}
