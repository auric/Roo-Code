import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface ListFilesParams {
	path: string
	recursive?: boolean
}

export function getListFilesDescription(args: ToolArgs): string {
	return `## list_files
Description: Request to list files and directories within the specified directory. If recursive is true, it will list all files and directories recursively. If recursive is false or not provided, it will only list the top-level contents. Do not use this tool to confirm the existence of files you may have created, as the user will let you know if the files were created successfully or not.
Parameters:
- path: (required) The path of the directory to list contents for (relative to the current workspace directory ${args.cwd})
- recursive: (optional) Whether to list files recursively. Use true for recursive listing, false or omit for top-level only.
Usage:
<list_files>
<path>Directory path here</path>
<recursive>true or false (optional)</recursive>
</list_files>

Example: Requesting to list all files in the current directory
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>`
}

export const listFilesNativeTool: vscode.LanguageModelChatTool = {
	name: "list_files" as ToolName,
	description: "Lists files and directories within a specified path, optionally recursively.",
	inputSchema: {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the directory (relative to workspace root) whose contents will be listed.",
			},
			recursive: {
				type: "boolean",
				description: "Whether to list contents recursively. Defaults to false.",
			},
		},
		required: ["path"],
	},
}
