# STORY-005: Get WiFi Channel Info with Band Detection

## User Story

As a network administrator,
I want to retrieve WiFi channel information with automatic band detection via MCP,
So that I can verify channel assignments and identify which band each radio operates on.

## Description

Provide an MCP tool that queries all WiFi interfaces (wifi0, wifi1, wifi2) and reports channel info with frequency-based band detection. Uses actual MHz frequency to determine band rather than relying on interface naming conventions.

- wifi0: 2.4GHz
- wifi1: 5GHz
- wifi2: 5GHz or 6GHz (detected by frequency)

## Acceptance Criteria

- [x] Tool queries channel info for wifi0, wifi1, and wifi2 interfaces
- [x] Detects band from frequency (2.4GHz, 5GHz, 6GHz) not interface name
- [x] Reports channel number, frequency, and bandwidth per interface
- [x] Handles missing interfaces gracefully (wifi2 may not exist)
- [x] Returns structured JSON response

## Technical Notes

- Affected files: `src/tools/getWiFiChannelInfo.ts`, `src/index.ts`, `src/types.ts`
- MCP tools involved: `getWiFiChannelInfo`
- AP commands: WiFi channel/frequency rkscli commands

## Status

- Created: 2026-03-18
- Implemented: yes
- Tasks: none
- Tests: none
