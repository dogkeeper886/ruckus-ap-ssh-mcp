# STORY-004: Get Client Admission Control Config

## User Story

As a network administrator,
I want to check client admission control settings via MCP,
So that I can verify load balancing and client limits on each radio.

## Description

Provide an MCP tool that retrieves client admission control configuration for both WiFi interfaces on a Ruckus AP.

## Acceptance Criteria

- [x] Tool queries admission control config for both WiFi interfaces
- [x] Reports client limits and thresholds per interface
- [x] Returns structured JSON response

## Technical Notes

- Affected files: `src/tools/getClientAdmissionControl.ts`, `src/index.ts`, `src/types.ts`
- MCP tools involved: `getClientAdmissionControl`
- AP commands: client admission control rkscli commands

## Status

- Created: 2026-03-18
- Implemented: yes
- Tasks: none
- Tests: TC-INT-007
