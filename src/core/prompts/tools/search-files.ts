import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface SearchFilesParams {
	path: string
	regex: string
	file_pattern?: string
}

export function getSearchFilesDescription(args: ToolArgs): string {
	return `## search_files
Description: Request to perform a regex search across files in a specified directory, providing context-rich results. This tool searches for patterns or specific content across multiple files, displaying each match with encapsulating context.
Parameters:
- path: (required) The path of the directory to search in (relative to the current workspace directory ${args.cwd}). This directory will be recursively searched.
- regex: (required) The regular expression pattern to search for. Uses Rust regex syntax.
- file_pattern: (optional) Glob pattern to filter files (e.g., '*.ts' for TypeScript files). If not provided, it will search all files (*).
Usage:
<search_files>
<path>Directory path here</path>
<regex>Your regex pattern here</regex>
<file_pattern>file pattern here (optional)</file_pattern>
</search_files>

Example: Requesting to search for all .ts files in the current directory
<search_files>
<path>.</path>
<regex>.*</regex>
<file_pattern>*.ts</file_pattern>
</search_files>`
}

export const searchFilesNativeTool: vscode.LanguageModelChatTool = {
	name: "search_files" as ToolName,
	description: "Performs a regex search across files in a directory, optionally filtered by a glob pattern.",
	inputSchema: {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Directory to search in (relative to workspace root).",
			},
			regex: {
				type: "string",
				description: "The regular expression pattern to search for (Rust regex syntax).",
			},
			file_pattern: {
				type: "string",
				description: "Optional glob pattern to filter files (e.g., '*.ts'). Defaults to all files.",
			},
		},
		required: ["path", "regex"],
	},
}
