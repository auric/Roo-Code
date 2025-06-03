import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface WriteToFileParams {
	path: string
	content: string
	line_count: string // Native tool schema expects string.
}

export function getWriteToFileDescription(args: ToolArgs): string {
	return `## write_to_file
Description: Request to write content to a file. This tool is primarily used for **creating new files** or for scenarios where a **complete rewrite of an existing file is intentionally required**. If the file exists, it will be overwritten. If it doesn't exist, it will be created. This tool will automatically create any directories needed to write the file.
Parameters:
- path: (required) The path of the file to write to (relative to the current workspace directory ${args.cwd})
- content: (required) The content to write to the file. When performing a full rewrite of an existing file or creating a new one, ALWAYS provide the COMPLETE intended content of the file, without any truncation or omissions. You MUST include ALL parts of the file, even if they haven't been modified. Do NOT include the line numbers in the content though, just the actual content of the file.
- line_count: (required) The number of lines in the file. Make sure to compute this based on the actual content of the file, not the number of lines in the content you're providing.
Usage:
<write_to_file>
<path>File path here</path>
<content>
Your file content here
</content>
<line_count>total number of lines in the file, including empty lines</line_count>
</write_to_file>

Example: Requesting to write to frontend-config.json
<write_to_file>
<path>frontend-config.json</path>
<content>
{
  "apiEndpoint": "https://api.example.com",
  "theme": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "fontFamily": "Arial, sans-serif"
  },
  "features": {
    "darkMode": true,
    "notifications": true,
    "analytics": false
  },
  "version": "1.0.0"
}
</content>
<line_count>14</line_count>
</write_to_file>`
}

export const writeToFileNativeTool: vscode.LanguageModelChatTool = {
	name: "write_to_file" as ToolName,
	description:
		"Writes content to a file, overwriting if it exists or creating it if it doesn't. Creates necessary directories.",
	inputSchema: {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path of the file to write to (relative to workspace root).",
			},
			content: {
				type: "string",
				description: "The complete content to write to the file.",
			},
			line_count: {
				type: "string", // API expects string
				description: "The total number of lines in the provided content.",
			},
		},
		required: ["path", "content", "line_count"],
	},
}
