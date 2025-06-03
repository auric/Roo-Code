import * as vscode from "vscode"
import type { ToolName, ModeConfig } from "@roo-code/types"

import { TOOL_GROUPS, ALWAYS_AVAILABLE_TOOLS, DiffStrategy } from "../../../shared/tools"
import { McpHub } from "../../../services/mcp/McpHub"
import { Mode, getModeConfig, isToolAllowedForMode, getGroupName } from "../../../shared/modes"

import { ToolArgs } from "./types"
import { getExecuteCommandDescription } from "./execute-command"
import { getReadFileDescription } from "./read-file"
import { getFetchInstructionsDescription } from "./fetch-instructions"
import { getWriteToFileDescription } from "./write-to-file"
import { getSearchFilesDescription } from "./search-files"
import { getListFilesDescription } from "./list-files"
import { getInsertContentDescription } from "./insert-content"
import { getSearchAndReplaceDescription } from "./search-and-replace"
import { getListCodeDefinitionNamesDescription } from "./list-code-definition-names"
import { getBrowserActionDescription } from "./browser-action"
import { getAskFollowupQuestionDescription } from "./ask-followup-question"
import { getAttemptCompletionDescription } from "./attempt-completion"
import { getUseMcpToolDescription } from "./use-mcp-tool"
import { getAccessMcpResourceDescription } from "./access-mcp-resource"
import { getSwitchModeDescription } from "./switch-mode"
import { getNewTaskDescription } from "./new-task"
import { getCodebaseSearchDescription } from "./codebase-search"
import { CodeIndexManager } from "../../../services/code-index/manager"

import { executeCommandNativeTool } from "./execute-command"
import { getReadFileNativeTool } from "./read-file"
import { fetchInstructionsNativeTool } from "./fetch-instructions"
import { writeToFileNativeTool } from "./write-to-file"
import { searchFilesNativeTool } from "./search-files"
import { listFilesNativeTool } from "./list-files"
import { insertContentNativeTool } from "./insert-content"
import { searchAndReplaceNativeTool } from "./search-and-replace"
import { listCodeDefinitionNamesNativeTool } from "./list-code-definition-names"
import { getBrowserActionNativeTool } from "./browser-action"
import { askFollowupQuestionNativeTool } from "./ask-followup-question"
import { attemptCompletionNativeTool } from "./attempt-completion"
import { useMcpToolNativeTool } from "./use-mcp-tool"
import { accessMcpResourceNativeTool } from "./access-mcp-resource"
import { switchModeNativeTool } from "./switch-mode"
import { newTaskNativeTool } from "./new-task"
import { codebaseSearchNativeTool } from "./codebase-search"
import { applyDiffNativeTool } from "../../diff/strategies/multi-search-replace"

// Map of tool names to their description functions
const toolDescriptionMap: Record<string, (args: ToolArgs) => string | undefined> = {
	execute_command: (args) => getExecuteCommandDescription(args),
	read_file: (args) => getReadFileDescription(args),
	fetch_instructions: () => getFetchInstructionsDescription(),
	write_to_file: (args) => getWriteToFileDescription(args),
	search_files: (args) => getSearchFilesDescription(args),
	list_files: (args) => getListFilesDescription(args),
	list_code_definition_names: (args) => getListCodeDefinitionNamesDescription(args),
	browser_action: (args) => getBrowserActionDescription(args),
	ask_followup_question: () => getAskFollowupQuestionDescription(),
	attempt_completion: () => getAttemptCompletionDescription(),
	use_mcp_tool: (args) => getUseMcpToolDescription(args),
	access_mcp_resource: (args) => getAccessMcpResourceDescription(args),
	codebase_search: () => getCodebaseSearchDescription(),
	switch_mode: () => getSwitchModeDescription(),
	new_task: (args) => getNewTaskDescription(args),
	insert_content: (args) => getInsertContentDescription(args),
	search_and_replace: (args) => getSearchAndReplaceDescription(args),
	apply_diff: (args) => (args.diffStrategy ? args.diffStrategy.getToolDescription({ cwd: args.cwd }) : ""),
}

function getApplicableToolNamesForMode(
	mode: Mode,
	customModes: ModeConfig[] | undefined,
	experiments: Record<string, boolean> | undefined,
	codeIndexManager: CodeIndexManager | undefined,
	diffStrategy: DiffStrategy | undefined,
): Set<ToolName> {
	const config = getModeConfig(mode, customModes)
	const tools = new Set<ToolName>()

	// Add tools from mode's groups
	config.groups.forEach((groupEntry) => {
		const groupName = getGroupName(groupEntry)
		const toolGroup = TOOL_GROUPS[groupName]
		if (toolGroup) {
			toolGroup.tools.forEach((tool) => {
				if (
					isToolAllowedForMode(
						tool as ToolName,
						mode,
						customModes ?? [],
						undefined,
						undefined,
						experiments ?? {},
					)
				) {
					tools.add(tool as ToolName)
				}
			})
		}
	})

	// Add always available tools
	ALWAYS_AVAILABLE_TOOLS.forEach((tool) => tools.add(tool))

	// Conditionally exclude codebase_search if feature is disabled or not configured
	if (
		!codeIndexManager ||
		!(codeIndexManager.isFeatureEnabled && codeIndexManager.isFeatureConfigured && codeIndexManager.isInitialized)
	) {
		tools.delete("codebase_search")
	}

	if (!diffStrategy) {
		tools.delete("apply_diff")
	}
	return tools
}

export function getToolDescriptionsForMode(
	mode: Mode,
	cwd: string,
	supportsComputerUse: boolean,
	codeIndexManager?: CodeIndexManager,
	diffStrategy?: DiffStrategy,
	browserViewportSize?: string,
	mcpHub?: McpHub,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	partialReadsEnabled?: boolean,
	settings?: Record<string, any>,
): string {
	const args: ToolArgs = {
		// For description map
		cwd,
		supportsComputerUse,
		diffStrategy,
		browserViewportSize,
		mcpHub,
		partialReadsEnabled,
		settings,
	}

	const tools = getApplicableToolNamesForMode(mode, customModes, experiments, codeIndexManager, diffStrategy)

	const descriptions = Array.from(tools).map((toolName) => {
		const descriptionFn = toolDescriptionMap[toolName]
		if (!descriptionFn) {
			return undefined
		}

		return descriptionFn({
			...args,
		})
	})

	return `# Tools\n\n${descriptions.filter(Boolean).join("\n\n")}`
}

type NativeToolDefinition = vscode.LanguageModelChatTool | ((args: ToolArgs) => vscode.LanguageModelChatTool)

const nativeToolDefinitions: Partial<Record<ToolName, NativeToolDefinition>> = {
	apply_diff: applyDiffNativeTool,
	read_file: getReadFileNativeTool,
	ask_followup_question: askFollowupQuestionNativeTool,
	access_mcp_resource: accessMcpResourceNativeTool,
	attempt_completion: attemptCompletionNativeTool,
	browser_action: getBrowserActionNativeTool,
	codebase_search: codebaseSearchNativeTool,
	execute_command: executeCommandNativeTool,
	fetch_instructions: fetchInstructionsNativeTool,
	insert_content: insertContentNativeTool,
	list_code_definition_names: listCodeDefinitionNamesNativeTool,
	list_files: listFilesNativeTool,
	new_task: newTaskNativeTool,
	search_and_replace: searchAndReplaceNativeTool,
	search_files: searchFilesNativeTool,
	switch_mode: switchModeNativeTool,
	use_mcp_tool: useMcpToolNativeTool,
	write_to_file: writeToFileNativeTool,
}

export function getNativeToolsForMode(
	mode: Mode,
	args: ToolArgs,
	customModes?: ModeConfig[],
	experiments?: Record<string, boolean>,
	codeIndexManager?: CodeIndexManager,
): vscode.LanguageModelChatTool[] {
	const activeNativeTools: vscode.LanguageModelChatTool[] = []
	const applicableToolNames = getApplicableToolNamesForMode(
		mode,
		customModes,
		experiments,
		codeIndexManager,
		args.diffStrategy,
	)

	for (const toolName of applicableToolNames) {
		const definition = nativeToolDefinitions[toolName]
		if (definition) {
			if (typeof definition === "function") {
				activeNativeTools.push(definition(args))
			} else {
				activeNativeTools.push(definition)
			}
		} else {
			console.warn(`Roo Code <Native Tools>: Native tool definition not found for ${toolName}`)
		}
	}
	return activeNativeTools
}

// Export individual description functions for backward compatibility
export {
	getExecuteCommandDescription,
	getReadFileDescription,
	getFetchInstructionsDescription,
	getWriteToFileDescription,
	getSearchFilesDescription,
	getListFilesDescription,
	getListCodeDefinitionNamesDescription,
	getBrowserActionDescription,
	getAskFollowupQuestionDescription,
	getAttemptCompletionDescription,
	getUseMcpToolDescription,
	getAccessMcpResourceDescription,
	getSwitchModeDescription,
	getInsertContentDescription,
	getSearchAndReplaceDescription,
	getCodebaseSearchDescription,
}
