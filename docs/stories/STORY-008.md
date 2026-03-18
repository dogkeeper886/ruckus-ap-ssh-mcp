# STORY-008: Get WLAN Scheduler Configuration

## User Story

As a network administrator,
I want to retrieve WLAN scheduler configuration for all WLANs via MCP,
So that I can audit and verify WLAN operating hours across APs.

## Description

Add a `getWlanScheduler` MCP tool that queries the scheduler configuration for each WLAN interface on the AP. The tool first discovers active WLANs (via `get wlaninfo`), then runs `get scheduler wlanX` for each one. Returns structured JSON with timezone, profile ID, and a weekly schedule grid.

The AP scheduler uses hex values per hour where each hex digit represents 4x 15-minute quarters:
- `F` (1111) = fully on all 4 quarters
- `0` (0000) = off all 4 quarters
- `A` (1010) = on 2nd and 4th quarters
- etc.

## Acceptance Criteria

- [x] Tool discovers active WLANs by calling `get wlaninfo`
- [x] Executes `get scheduler wlanX` for each discovered WLAN
- [x] Parses timezone and profile ID from output
- [x] Parses weekly schedule grid (Sun–Sat, hours 0–23) into structured data
- [x] Decodes hex values into human-readable active/inactive per hour
- [x] Returns structured JSON per WLAN
- [x] Handles APs with no WLANs gracefully (empty response)
- [x] Returns error response on failure without crashing
- [x] Type defined in `src/types.ts`
- [x] Registered in `src/index.ts` (ListTools + CallTool)

## Technical Notes

- Affected files: `src/tools/getWlanScheduler.ts` (new), `src/index.ts`, `src/types.ts`
- MCP tools involved: `getWlanScheduler`
- AP commands: `get wlaninfo`, `get scheduler wlan0`, `get scheduler wlan32`, etc.
- Depends on WLAN discovery — reuse parsing from `getWlanInfo.ts` or call `get wlaninfo` directly

## Status

- Created: 2026-03-18
- Tasks: #7
- Tests: TC-INT-010
