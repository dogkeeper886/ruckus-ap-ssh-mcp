# STORY-003: Get External Antenna Info

## User Story

As a network administrator,
I want to retrieve external antenna mode and gain settings via MCP,
So that I can verify antenna configuration across deployed APs.

## Description

Provide an MCP tool that queries both WiFi interfaces on a Ruckus AP for external antenna mode and gain information.

## Acceptance Criteria

- [x] Tool queries antenna info for both WiFi interfaces
- [x] Reports antenna mode (internal/external) per interface
- [x] Reports antenna gain values
- [x] Returns structured JSON response

## Technical Notes

- Affected files: `src/tools/getExternalAntennaInfo.ts`, `src/index.ts`, `src/types.ts`
- MCP tools involved: `getExternalAntennaInfo`
- AP commands: antenna-related rkscli commands

## Status

- Created: 2026-03-18
- Implemented: yes
- Tasks: none
- Tests: none
