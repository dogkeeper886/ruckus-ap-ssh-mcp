# STORY-002: Get ACX Management Status

## User Story

As a network administrator,
I want to check the ACX management status and connection details via MCP,
So that I can verify whether the AP is managed by a controller and troubleshoot connectivity.

## Description

Provide an MCP tool that runs the ACX status command on a Ruckus AP and returns the management state, controller IP, and connection details.

## Acceptance Criteria

- [x] Tool executes ACX status command on AP via SSH
- [x] Parses management status (managed/standalone)
- [x] Returns controller connection details if managed
- [x] Returns structured JSON response

## Technical Notes

- Affected files: `src/tools/getACXStatus.ts`, `src/index.ts`, `src/types.ts`
- MCP tools involved: `getACXStatus`
- AP commands: ACX status related rkscli commands

## Status

- Created: 2026-03-18
- Implemented: yes
- Tasks: none
- Tests: none
