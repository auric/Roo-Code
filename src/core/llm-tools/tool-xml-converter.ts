import type { ToolName } from "@roo-code/types"

import type { AccessMcpResourceParams } from "../prompts/tools/access-mcp-resource"
import type { ApplyDiffParams } from "../diff/strategies/multi-search-replace"
import type { AskFollowupQuestionParams } from "../prompts/tools/ask-followup-question"
import type { AttemptCompletionParams } from "../prompts/tools/attempt-completion"
import type { BrowserActionParams } from "../prompts/tools/browser-action"
import type { CodebaseSearchParams } from "../prompts/tools/codebase-search"
import type { ExecuteCommandParams } from "../prompts/tools/execute-command"
import type { FetchInstructionsParams } from "../prompts/tools/fetch-instructions"
import type { InsertContentParams } from "../prompts/tools/insert-content"
import type { ListCodeDefinitionNamesParams } from "../prompts/tools/list-code-definition-names"
import type { ListFilesParams } from "../prompts/tools/list-files"
import type { NewTaskParams } from "../prompts/tools/new-task"
import type { ReadFileParams, ReadFileFileArg } from "../prompts/tools/read-file"
import type { SearchAndReplaceParams } from "../prompts/tools/search-and-replace"
import type { SearchFilesParams } from "../prompts/tools/search-files"
import type { SwitchModeParams } from "../prompts/tools/switch-mode"
import type { UseMcpToolParams } from "../prompts/tools/use-mcp-tool"
import type { WriteToFileParams } from "../prompts/tools/write-to-file"

export type ToolXmlConversionFunction = (input: Record<string, any>) => string

const toolConverters: Partial<Record<ToolName, ToolXmlConversionFunction>> = {}

function escapeXml(unsafe: string): string {
	if (typeof unsafe !== "string") {
		// console.warn('escapeXml called with non-string value:', unsafe);
		return ""
	}
	return unsafe.replace(/[<>&"'']/g, (c) => {
		switch (c) {
			case "<":
				return "&lt;"
			case ">":
				return "&gt;"
			case "&":
				return "&amp;"
			case '"':
				return "&quot;"
			case "\'":
				return "&apos;"
			default:
				return c
		}
	})
}

export function convertToolCallInputToXml(toolName: ToolName, input: Record<string, any>): string {
	const converter = toolConverters[toolName]
	if (converter) {
		try {
			return converter(input)
		} catch (error) {
			console.error(`Roo Code <Language Model API>: Error in specific XML converter for tool: ${toolName}`, error)
			// Fall through to generic conversion if specific one fails
		}
	}
	console.warn(
		`Roo Code <Language Model API>: No specific XML converter for tool: ${toolName}. Using generic conversion.`,
	)

	let xml = `<${escapeXml(toolName)}>\n`
	for (const key in input) {
		if (Object.prototype.hasOwnProperty.call(input, key)) {
			const value = input[key]
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					xml += `  <${escapeXml(key)}>\n`
					for (const item of value) {
						if (typeof item === "object" && item !== null) {
							const objectElementTag = key === "args" && toolName === "read_file" ? "file" : "item" // Specific handling for read_file args
							xml += `    <${escapeXml(objectElementTag)}>\n`
							for (const subKey in item) {
								if (Object.prototype.hasOwnProperty.call(item, subKey)) {
									xml += `      <${escapeXml(subKey)}>${escapeXml(String((item as any)[subKey]))}</${escapeXml(subKey)}>\n`
								}
							}
							xml += `    </${escapeXml(objectElementTag)}>\n`
						} else {
							xml += `    <item>${escapeXml(String(item))}</item>\n`
						}
					}
					xml += `  </${escapeXml(key)}>\n`
				} else if (typeof value === "object") {
					xml += `  <${escapeXml(key)}>\n`
					for (const subKey in value) {
						if (Object.prototype.hasOwnProperty.call(value, subKey)) {
							xml += `    <${escapeXml(subKey)}>${escapeXml(String((value as any)[subKey]))}</${escapeXml(subKey)}>\n`
						}
					}
					xml += `  </${escapeXml(key)}>\n`
				} else {
					xml += `  <${escapeXml(key)}>${escapeXml(String(value))}</${escapeXml(key)}>\n`
				}
			}
		}
	}
	xml += `</${escapeXml(toolName)}>`
	return xml
}

export function registerToolXmlConverter(toolName: ToolName, converter: ToolXmlConversionFunction): void {
	if (toolConverters[toolName]) {
		console.warn(`Roo Code <Language Model API>: Overwriting XML converter for tool: ${toolName}.`)
	}
	toolConverters[toolName] = converter
}

// --- Specific Tool XML Conversion Functions ---

// access_mcp_resource
function convertAccessMcpResourceToXml(params: AccessMcpResourceParams): string {
	let xml = `<access_mcp_resource>\n`
	xml += `  <server_name>${escapeXml(params.server_name)}</server_name>\n`
	xml += `  <uri>${escapeXml(params.uri)}</uri>\n`
	xml += `</access_mcp_resource>`
	return xml
}
registerToolXmlConverter("access_mcp_resource" as ToolName, convertAccessMcpResourceToXml as ToolXmlConversionFunction)

// apply_diff
function convertApplyDiffToXml(params: ApplyDiffParams): string {
	let xml = `<apply_diff>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `  <diff>${escapeXml(params.diff)}</diff>\n`
	xml += `</apply_diff>`
	return xml
}
registerToolXmlConverter("apply_diff" as ToolName, convertApplyDiffToXml as ToolXmlConversionFunction)

// ask_followup_question
function convertAskFollowupQuestionToXml(params: AskFollowupQuestionParams): string {
	let xml = `<ask_followup_question>\n`
	xml += `  <question>${escapeXml(params.question)}</question>\n`
	if (params.follow_up && params.follow_up.length > 0) {
		xml += `  <follow_up>\n`
		for (const item of params.follow_up) {
			// Assuming follow_up is Array<{ suggest: string }>
			xml += `    <suggest>${escapeXml(item.suggest)}</suggest>\n`
		}
		xml += `  </follow_up>\n`
	}
	xml += `</ask_followup_question>`
	return xml
}
registerToolXmlConverter(
	"ask_followup_question" as ToolName,
	convertAskFollowupQuestionToXml as ToolXmlConversionFunction,
)

// attempt_completion
function convertAttemptCompletionToXml(params: AttemptCompletionParams): string {
	let xml = `<attempt_completion>\n`
	xml += `  <result>${escapeXml(params.result)}</result>\n`
	if (params.command !== undefined) {
		xml += `  <command>${escapeXml(params.command)}</command>\n`
	}
	xml += `</attempt_completion>`
	return xml
}
registerToolXmlConverter("attempt_completion" as ToolName, convertAttemptCompletionToXml as ToolXmlConversionFunction)

// browser_action
function convertBrowserActionToXml(params: BrowserActionParams): string {
	let xml = `<browser_action>\n`
	xml += `  <action>${escapeXml(params.action)}</action>\n`
	if (params.url !== undefined) {
		xml += `  <url>${escapeXml(params.url)}</url>\n`
	}
	if (params.coordinate !== undefined) {
		xml += `  <coordinate>${escapeXml(params.coordinate)}</coordinate>\n`
	}
	if (params.text !== undefined) {
		xml += `  <text>${escapeXml(params.text)}</text>\n`
	}
	if (params.size !== undefined) {
		xml += `  <size>${escapeXml(params.size)}</size>\n`
	}
	xml += `</browser_action>`
	return xml
}
registerToolXmlConverter("browser_action" as ToolName, convertBrowserActionToXml as ToolXmlConversionFunction)

// codebase_search
function convertCodebaseSearchToXml(params: CodebaseSearchParams): string {
	let xml = `<codebase_search>\n`
	xml += `  <query>${escapeXml(params.query)}</query>\n`
	if (params.path !== undefined) {
		xml += `  <path>${escapeXml(params.path)}</path>\n`
	}
	xml += `</codebase_search>`
	return xml
}
registerToolXmlConverter("codebase_search" as ToolName, convertCodebaseSearchToXml as ToolXmlConversionFunction)

// execute_command
function convertExecuteCommandToXml(params: ExecuteCommandParams): string {
	let xml = `<execute_command>\n`
	xml += `  <command>${escapeXml(params.command)}</command>\n`
	if (params.cwd !== undefined) {
		xml += `  <cwd>${escapeXml(params.cwd)}</cwd>\n`
	}
	xml += `</execute_command>`
	return xml
}
registerToolXmlConverter("execute_command" as ToolName, convertExecuteCommandToXml as ToolXmlConversionFunction)

// fetch_instructions
function convertFetchInstructionsToXml(params: FetchInstructionsParams): string {
	let xml = `<fetch_instructions>\n`
	xml += `  <task>${escapeXml(params.task)}</task>\n`
	xml += `</fetch_instructions>`
	return xml
}
registerToolXmlConverter("fetch_instructions" as ToolName, convertFetchInstructionsToXml as ToolXmlConversionFunction)

// insert_content
function convertInsertContentToXml(params: InsertContentParams): string {
	let xml = `<insert_content>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `  <line>${escapeXml(String(params.line))}</line>\n`
	xml += `  <content>${escapeXml(params.content)}</content>\n`
	xml += `</insert_content>`
	return xml
}
registerToolXmlConverter("insert_content" as ToolName, convertInsertContentToXml as ToolXmlConversionFunction)

// list_code_definition_names
function convertListCodeDefinitionNamesToXml(params: ListCodeDefinitionNamesParams): string {
	let xml = `<list_code_definition_names>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `</list_code_definition_names>`
	return xml
}
registerToolXmlConverter(
	"list_code_definition_names" as ToolName,
	convertListCodeDefinitionNamesToXml as ToolXmlConversionFunction,
)

// list_files
function convertListFilesToXml(params: ListFilesParams): string {
	let xml = `<list_files>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	if (params.recursive !== undefined) {
		xml += `  <recursive>${escapeXml(String(params.recursive))}</recursive>\n`
	}
	xml += `</list_files>`
	return xml
}
registerToolXmlConverter("list_files" as ToolName, convertListFilesToXml as ToolXmlConversionFunction)

// new_task
function convertNewTaskToXml(params: NewTaskParams): string {
	let xml = `<new_task>\n`
	xml += `  <mode>${escapeXml(params.mode)}</mode>\n`
	xml += `  <message>${escapeXml(params.message)}</message>\n`
	xml += `</new_task>`
	return xml
}
registerToolXmlConverter("new_task" as ToolName, convertNewTaskToXml as ToolXmlConversionFunction)

// read_file
function convertReadFileToXml(params: ReadFileParams): string {
	let xml = `<read_file>\n`
	if (params.args && params.args.length > 0) {
		xml += `  <args>\n`
		for (const arg of params.args) {
			xml += `    <file>\n`
			xml += `      <path>${escapeXml(arg.path)}</path>\n`
			if (arg.line_range !== undefined) {
				// Ensure line_range is a string before escaping
				const lineRangeStr = Array.isArray(arg.line_range) ? arg.line_range.join(",") : arg.line_range
				xml += `      <line_range>${escapeXml(lineRangeStr)}</line_range>\n`
			}
			xml += `    </file>\n`
		}
		xml += `  </args>\n`
	}
	xml += `</read_file>`
	return xml
}
registerToolXmlConverter("read_file" as ToolName, convertReadFileToXml as ToolXmlConversionFunction)

// search_and_replace
function convertSearchAndReplaceToXml(params: SearchAndReplaceParams): string {
	let xml = `<search_and_replace>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `  <search>${escapeXml(params.search)}</search>\n`
	xml += `  <replace>${escapeXml(params.replace)}</replace>\n`
	if (params.start_line !== undefined) {
		xml += `  <start_line>${escapeXml(String(params.start_line))}</start_line>\n`
	}
	if (params.end_line !== undefined) {
		xml += `  <end_line>${escapeXml(String(params.end_line))}</end_line>\n`
	}
	if (params.use_regex !== undefined) {
		xml += `  <use_regex>${escapeXml(String(params.use_regex))}</use_regex>\n`
	}
	if (params.ignore_case !== undefined) {
		xml += `  <ignore_case>${escapeXml(String(params.ignore_case))}</ignore_case>\n`
	}
	xml += `</search_and_replace>`
	return xml
}
registerToolXmlConverter("search_and_replace" as ToolName, convertSearchAndReplaceToXml as ToolXmlConversionFunction)

// search_files
function convertSearchFilesToXml(params: SearchFilesParams): string {
	let xml = `<search_files>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `  <regex>${escapeXml(params.regex)}</regex>\n`
	if (params.file_pattern !== undefined) {
		xml += `  <file_pattern>${escapeXml(params.file_pattern)}</file_pattern>\n`
	}
	xml += `</search_files>`
	return xml
}
registerToolXmlConverter("search_files" as ToolName, convertSearchFilesToXml as ToolXmlConversionFunction)

// switch_mode
function convertSwitchModeToXml(params: SwitchModeParams): string {
	let xml = `<switch_mode>\n`
	xml += `  <mode_slug>${escapeXml(params.mode_slug)}</mode_slug>\n`
	if (params.reason !== undefined) {
		xml += `  <reason>${escapeXml(params.reason)}</reason>\n`
	}
	xml += `</switch_mode>`
	return xml
}
registerToolXmlConverter("switch_mode" as ToolName, convertSwitchModeToXml as ToolXmlConversionFunction)

// use_mcp_tool
function convertUseMcpToolToXml(params: UseMcpToolParams): string {
	let xml = `<use_mcp_tool>\n`
	xml += `  <server_name>${escapeXml(params.server_name)}</server_name>\n`
	xml += `  <tool_name>${escapeXml(params.tool_name)}</tool_name>\n`
	// Ensure arguments is a string before escaping
	const argsString = typeof params.arguments === "string" ? params.arguments : JSON.stringify(params.arguments)
	xml += `  <arguments>${escapeXml(argsString)}</arguments>\n`
	xml += `</use_mcp_tool>`
	return xml
}
registerToolXmlConverter("use_mcp_tool" as ToolName, convertUseMcpToolToXml as ToolXmlConversionFunction)

// write_to_file
function convertWriteToFileToXml(params: WriteToFileParams): string {
	let xml = `<write_to_file>\n`
	xml += `  <path>${escapeXml(params.path)}</path>\n`
	xml += `  <content>${escapeXml(params.content)}</content>\n`
	xml += `  <line_count>${escapeXml(String(params.line_count))}</line_count>\n`
	xml += `</write_to_file>`
	return xml
}
registerToolXmlConverter("write_to_file" as ToolName, convertWriteToFileToXml as ToolXmlConversionFunction)
