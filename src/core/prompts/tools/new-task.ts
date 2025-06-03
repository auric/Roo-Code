import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface NewTaskParams {
	mode: string
	message: string
}

export function getNewTaskDescription(_args: ToolArgs): string {
	return `## new_task
Description: This will let you create a new task instance in the chosen mode using your provided message.

Parameters:
- mode: (required) The slug of the mode to start the new task in (e.g., "code", "debug", "architect").
- message: (required) The initial user message or instructions for this new task.

Usage:
<new_task>
<mode>your-mode-slug-here</mode>
<message>Your initial instructions here</message>
</new_task>

Example:
<new_task>
<mode>code</mode>
<message>Implement a new feature for the application.</message>
</new_task>
`
}

export const newTaskNativeTool: vscode.LanguageModelChatTool = {
	name: "new_task" as ToolName,
	description: "Creates a new sub-task instance in a chosen mode with an initial message.",
	inputSchema: {
		type: "object",
		properties: {
			mode: {
				type: "string",
				description: "Slug of the mode for the new task (e.g., 'code').",
			},
			message: {
				type: "string",
				description: "Initial message/instructions for the new task.",
			},
		},
		required: ["mode", "message"],
	},
}
