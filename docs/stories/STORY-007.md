# STORY-007: Get WLAN Interface Info

## User Story

As a network administrator,
I want to retrieve structured WLAN interface details via MCP,
So that I can audit SSID configurations, security settings, and firewall profiles across APs.

## Description

Add a dedicated MCP tool that executes `get wlaninfo` on the Ruckus AP and returns structured JSON with per-WLAN interface details. Currently this data is only available via the generic `runCommand` tool which returns raw unparsed output.

## Acceptance Criteria

- [x] Tool executes `get wlaninfo` via `executeSSHCommand()`
- [x] Parses raw output into structured JSON per WLAN interface
- [x] Each WLAN entry includes: ssid, bssid, channel, security, auth, cipher, firewallProfile
- [x] Handles APs with varying numbers of WLANs (single, multiple, none)
- [x] Returns error response on failure without crashing
- [x] Type defined in `src/types.ts`
- [x] Registered in `src/index.ts` (ListTools + CallTool)

## Technical Notes

- Affected files: `src/tools/getWlanInfo.ts` (new), `src/index.ts`, `src/types.ts`
- MCP tools involved: `getWlanInfo`
- AP commands: `get wlaninfo`

## Status

- Created: 2026-03-18
- Tasks: #5
- Tests: TC-INT-009
