# STORY-006: Run Arbitrary CLI Command on AP

## User Story

As a network administrator,
I want to execute any rkscli command on the AP via MCP,
So that I can query or configure the AP without being limited to predefined tools.

## Description

Add a generic `runCommand` MCP tool that accepts a command string, executes it on the Ruckus AP via SSH, and returns the raw output. This complements the existing specialized tools by allowing ad-hoc commands for troubleshooting, configuration, or exploring AP capabilities not yet covered by dedicated tools.

## Acceptance Criteria

- [x] Tool accepts a `command` string parameter (required)
- [x] Executes the command on the AP via `executeSSHCommand()`
- [x] Returns raw output as text (no parsing)
- [x] Handles empty command gracefully (returns login banner)
- [x] Handles command errors without crashing (invalid commands return AP error message)
- [x] Registered in index.ts with clear description

## Technical Notes

- Affected files: `src/tools/runCommand.ts` (new), `src/index.ts`
- MCP tools involved: `runCommand`
- AP commands: any rkscli command (e.g., `get devicename`, `get boarddata`, `get wlanlist`)
- Uses existing `executeSSHCommand()` from `src/utils/sshClient.ts`
- No new types needed — returns raw string

## Status

- Created: 2026-03-18
- Tasks: #1, #2
- Tests: TC-INT-001, TC-INT-002, TC-INT-003
