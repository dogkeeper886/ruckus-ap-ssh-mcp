# Ruckus AP SSH MCP Server

MCP server that provides tools for managing Ruckus APs over SSH. Uses rkscli commands via `executeSSHCommand()` from `src/utils/sshClient.ts`.

## Project Structure

```
src/
├── index.ts                    # MCP server entry point, tool registration
├── types.ts                    # TypeScript interfaces
├── tools/                      # One file per MCP tool
│   ├── getSerialNumber.ts
│   ├── getACXStatus.ts
│   ├── getExternalAntennaInfo.ts
│   ├── getClientAdmissionControl.ts
│   ├── getWiFiChannelInfo.ts
│   └── runCommand.ts
└── utils/
    └── sshClient.ts            # SSH connection and command execution

commands/                       # Slash command definitions (markdown)
├── dev/                        # Dev flow commands
├── ci/                         # CI/test flow commands
└── utility/                    # Session summary, evolve

docs/
├── stories/                    # User story files (STORY-XXX.md)
├── session_summaries/          # Session summaries (gitignored)
└── evolve/                     # Evolve reports

cicd/tests/
├── src/                        # Test framework (TypeScript)
│   ├── cli.ts                  # Test runner CLI
│   ├── mcp-client.ts           # Lightweight MCP client for testing
│   ├── executor.ts             # Test execution engine
│   ├── loader.ts               # YAML test case loader
│   ├── judge/                  # Simple + LLM judge
│   └── reporter/               # Console + JSON reporters
└── testcases/                  # YAML test definitions
    ├── build/
    ├── integration/            # TC-INT-001 through TC-INT-008
    └── e2e/
```

## Development Flows

### Dev Flow: User Input → Implementation

Use these slash commands in sequence to go from idea to working code:

```
/dev-story [description]    → creates docs/stories/STORY-XXX.md
/dev-tasks STORY-XXX        → breaks story into GitHub issues
/dev-impl STORY-XXX         → implements tasks, closes issues
```

| Command | Trigger | What it does |
|---------|---------|-------------|
| `/dev-story` | User has a new feature idea or requirement | Creates a structured user story file with acceptance criteria |
| `/dev-tasks` | A story file exists and needs to be broken down | Creates GitHub issues for each task, updates story status |
| `/dev-impl` | Tasks exist and need implementation | Writes code following project patterns, builds, closes issues |

### CI Flow: User Story → Test Cases → Run

Use these slash commands to create and run tests:

```
/ci-testcase STORY-XXX      → creates cicd/tests/testcases/TC-*.yml
/ci-run [STORY-XXX|TC-ID]   → executes tests against live AP
```

| Command | Trigger | What it does |
|---------|---------|-------------|
| `/ci-testcase` | A story needs test coverage | Generates YAML test cases that call MCP tools via mcp-client.ts |
| `/ci-run` | Test cases exist and need execution | Runs tests, applies simple/LLM judge, reports results |

**Running tests from CLI (without slash command):**

```bash
cd cicd/tests
npm test                      # Run all tests (simple judge)
npm run test:integration      # Integration suite only
npm run test:llm              # With LLM judge enabled
npm run list                  # List available tests
```

### Improvement Flow: Session → Evolve

Use these commands at end of session or periodically:

```
/session-summary              → saves session patterns to docs/session_summaries/
/evolve                       → analyzes history, proposes improvements
```

| Command | Trigger | What it does |
|---------|---------|-------------|
| `/session-summary` | End of a work session | Records workflow patterns, friction points, feeds /evolve |
| `/evolve` | Periodically, or when friction points accumulate | Analyzes issues + commits + session patterns, proposes actions |

**Pipeline:** `/session-summary` → `patterns.md` → `/evolve` → actions

## Adding a New MCP Tool

**Always create a story first** — even if a GitHub issue already exists. The story file is the single source of truth that links tasks, implementation, and tests.

1. **Create story:** `/dev-story` with the feature description
2. **Create tasks:** `/dev-tasks STORY-XXX`
3. **Implement:**
   - Create `src/tools/newTool.ts` — follow existing tool patterns
   - Register in `src/index.ts` (import, ListTools entry, CallTool case)
   - Add types to `src/types.ts` if needed
4. **Build:** `npm run build`
5. **Create tests:** `/ci-testcase STORY-XXX`
6. **Run tests:** `cd cicd/tests && npm test`
7. **Commit and push**

### Tool Pattern

```typescript
import { executeSSHCommand } from '../utils/sshClient.js';

export async function newTool() {
  try {
    const output = await executeSSHCommand('rkscli command here');
    // Parse output into structured data
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}
```

### Test Case Pattern

Test cases use `mcp-client.ts` to spawn the MCP server and call tools:

```yaml
id: TC-INT-XXX
name: Descriptive test name
suite: integration
story: STORY-XXX
priority: 1
timeout: 30000
dependencies: []

steps:
  - name: Call the tool
    command: npx tsx cicd/tests/src/mcp-client.ts toolName '{"arg":"value"}'
    expectPatterns:
      - "expected_field"
    rejectPatterns:
      - "isError"

criteria: |
  What this test verifies in plain language.
```

**Important:** `mcp-client.ts` returns double-encoded JSON (the tool's JSON is inside a `text` field). Use bare strings in patterns (e.g., `model`, `serial`) — not quoted forms like `'"model"'` which won't match the escaped output `\"model\"`.

## MCP Tools Available

| Tool | Description | Story | Test |
|------|-------------|-------|------|
| `getSerialNumber` | AP serial number and model from login banner | STORY-001 | TC-INT-004 |
| `getACXStatus` | ACX management status and connection details | STORY-002 | TC-INT-005 |
| `getExternalAntennaInfo` | External antenna mode/gain for WiFi interfaces | STORY-003 | TC-INT-006 |
| `getClientAdmissionControl` | Client admission control config per radio | STORY-004 | TC-INT-007 |
| `getWiFiChannelInfo` | WiFi channel info with frequency-based band detection | STORY-005 | TC-INT-008 |
| `getWlanList` | List all configured WLANs with status, SSID, BSSID, radio | STORY-009 | — |
| `runCommand` | Execute arbitrary rkscli command, return raw output | STORY-006 | TC-INT-001/002/003 |

## Environment

- **AP credentials:** Set via `.env` file (local/CI) or `-e` flags (MCP server)
- **Required:** `AP_IP`, `AP_USERNAME`, `AP_PASSWORD`
- **Optional:** `SSH_DEBUG=true` for debug logging
- **Build:** `npm run build` (TypeScript → dist/)
- **Test deps:** `cd cicd/tests && npm install`
