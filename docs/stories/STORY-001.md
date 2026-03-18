# STORY-001: Get AP Serial Number and Model Info

## User Story

As a network administrator,
I want to retrieve the AP serial number and model information via MCP,
So that I can identify and inventory access points remotely.

## Description

Provide an MCP tool that connects to a Ruckus AP over SSH and extracts the serial number and model name from the login banner. The banner follows the format: `Ruckus <model> AP: <serial>`.

## Acceptance Criteria

- [x] Tool connects to AP via SSH using configured credentials
- [x] Parses model name from login banner (e.g., "R320 Multimedia Hotzone Wireless")
- [x] Parses 12+ digit serial number from banner
- [x] Returns structured JSON with `model` and `serial` fields
- [x] Falls back to raw output if banner format is unexpected

## Technical Notes

- Affected files: `src/tools/getSerialNumber.ts`, `src/index.ts`, `src/types.ts`
- MCP tools involved: `getSerialNumber`
- AP commands: none (reads login banner only)

## Status

- Created: 2026-03-18
- Implemented: yes
- Tasks: none
- Tests: TC-INT-004
