import * as vscode from "vscode"
import type { ToolName } from "@roo-code/types"
import { ToolArgs } from "./types"

export interface SearchAndReplaceParams {
	path: string
	search: string
	replace: string
	start_line?: string // Native tool schema expects string.
	end_line?: string // Native tool schema expects string.
	use_regex?: boolean
	ignore_case?: boolean
}

export function getSearchAndReplaceDescription(args: ToolArgs): string {
	return `## search_and_replace
Description: Use this tool to find and replace specific text strings or patterns (using regex) within a file. It's suitable for targeted replacements across multiple locations within the file. Supports literal text and regex patterns, case sensitivity options, and optional line ranges. Shows a diff preview before applying changes.

Required Parameters:
- path: The path of the file to modify (relative to the current workspace directory ${args.cwd.toPosix()})
- search: The text or pattern to search for
- replace: The text to replace matches with

Optional Parameters:
- start_line: Starting line number for restricted replacement (1-based)
- end_line: Ending line number for restricted replacement (1-based)
- use_regex: Set to "true" to treat search as a regex pattern (default: false)
- ignore_case: Set to "true" to ignore case when matching (default: false)

Notes:
- When use_regex is true, the search parameter is treated as a regular expression pattern
- When ignore_case is true, the search is case-insensitive regardless of regex mode

Examples:

1. Simple text replacement:
<search_and_replace>
<path>example.ts</path>
<search>oldText</search>
<replace>newText</replace>
</search_and_replace>

2. Case-insensitive regex pattern:
<search_and_replace>
<path>example.ts</path>
<search>old\w+</search>
<replace>new$&</replace>
<use_regex>true</use_regex>
<ignore_case>true</ignore_case>
</search_and_replace>`
}

export const searchAndReplaceNativeTool: vscode.LanguageModelChatTool = {
	name: "search_and_replace" as ToolName,
	description:
		"Finds and replaces text or regex patterns within a file, with options for case sensitivity and line ranges.",
	inputSchema: {
		type: "object",
		properties: {
			path: {
				type: "string",
				description: "Path to the file to modify (relative to workspace root).",
			},
			search: {
				type: "string",
				description: "The text or regex pattern to search for.",
			},
			replace: {
				type: "string",
				description: "The text to replace matches with.",
			},
			start_line: {
				type: "string",
				description: "Optional starting line number (1-based) for the search range.",
			},
			end_line: {
				type: "string",
				description: "Optional ending line number (1-based) for the search range.",
			},
			use_regex: {
				type: "boolean",
				description: "Set to true to treat the search parameter as a regex pattern. Defaults to false.",
			},
			ignore_case: {
				type: "boolean",
				description: "Set to true to perform a case-insensitive search. Defaults to false.",
			},
		},
		required: ["path", "search", "replace"],
	},
}
