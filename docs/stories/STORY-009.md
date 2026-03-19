# STORY-009: Get WLAN List

## User Story

As a network administrator,
I want to retrieve the list of configured WLANs on the AP via MCP,
So that I can quickly see all WLAN interfaces and their basic configuration (SSID, BSSID, state).

## Description

Add a `getWlanList` MCP tool that executes the `get wlanlist` rkscli command on the AP and parses the output into structured JSON. The command returns a table of WLAN interfaces with columns like WLAN index, SSID, BSSID, status, and other summary fields. The tool should parse this tabular output into an array of objects, one per WLAN entry.

## Acceptance Criteria

- [x] Tool executes `get wlanlist` via `executeSSHCommand()`
- [x] Parses tabular output into structured JSON array
- [x] Each entry includes available fields (e.g., WLAN index, SSID, BSSID, state/status)
- [x] Returns empty array if no WLANs are configured
- [x] Returns error response on failure without crashing
- [x] Type defined in `src/types.ts`
- [x] Registered in `src/index.ts` (ListTools + CallTool)
- [x] Builds cleanly with `npm run build`

## Technical Notes

- Affected files: `src/tools/getWlanList.ts` (new), `src/index.ts`, `src/types.ts`
- MCP tools involved: `getWlanList`
- AP commands: `get wlanlist`
- Follow existing tool patterns (e.g., `getWlanInfo.ts`, `getWiFiChannelInfo.ts`)

## Status

- Created: 2026-03-19
- Tasks: #8
- Tests: none
