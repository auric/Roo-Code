import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface InsertContentParams {
	path: string
	line: string // 0 for append. Native tool schema expects string.
	content: string
}

export function getInsertContentDescription(args: ToolArgs): string {
	return `## insert_content
Description: Use this tool specifically for adding new lines of content into a file without modifying existing content. Specify the line number to insert before, or use line 0 to append to the end. Ideal for adding imports, functions, configuration blocks, log entries, or any multi-line text block.

Parameters:
- path: (required) File path relative to workspace directory ${args.cwd.toPosix()}
- line: (required) Line number where content will be inserted (1-based)
	      Use 0 to append at end of file
	      Use any positive number to insert before that line
- content: (required) The content to insert at the specified line

Example for inserting imports at start of file:
<insert_content>
<path>src/utils.ts</path>
<line>1</line>
<content>
// Add imports at start of file
import { sum } from './math';
</content>
</insert_content>

Example for appending to the end of file:
<insert_content>
<path>src/utils.ts</path>
<line>0</line>
<content>
// This is the end of the file
</content>
</insert_content>
`
}

export const insertContentNativeTool: vscode.LanguageModelChatTool = {
	name: "insert_content" as ToolName,
	description: "Inserts new lines of content into a file at a specified line number or appends to the end.",
	inputSchema: {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the file (relative to workspace root).",
			},
			line: {
				type: "string", // API expects string, even though it's a number conceptually
				description: "Line number (1-based) to insert before, or '0' to append to the end of the file.",
			},
			content: {
				type: "string",
				description: "The content to insert.",
			},
		},
		required: ["path", "line", "content"],
	},
}
