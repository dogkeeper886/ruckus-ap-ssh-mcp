# Create Test Case from Story

Generate a YAML test case file that tests a user story via MCP tools.

```
{{input}}

## PURPOSE

Read a user story and generate YAML test case(s) that verify the acceptance criteria by calling MCP tools on a live AP.

---

## AGENT WORKFLOW

### Step 1: Read the Story

Read the story file from `docs/stories/`. The input should be a story ID (e.g., `STORY-001`).

If no story ID provided, list available stories and ask the user to pick one.

### Step 2: Identify What to Test

From the acceptance criteria, determine:
- Which MCP tools to call (e.g., `mcp__ruckus-ap-ssh__getSerialNumber`)
- What output to expect (patterns, values)
- What would indicate failure

### Step 3: Generate Test Case YAML

Create test case file(s) in `cicd/tests/testcases/` using this format:

```yaml
id: TC-[SUITE]-[NUMBER]
name: [Descriptive test name]
suite: [build|integration|e2e]
story: STORY-XXX
priority: [1-10, lower = runs first]
timeout: 30000
dependencies: []

steps:
  - name: [Step description]
    mcp_tool: [tool name, e.g., getSerialNumber]
    mcp_args: {}
    expectPatterns:
      - "[regex pattern for expected output]"
    rejectPatterns:
      - "error"
      - "Error"

criteria: |
  [Human-readable test criteria from the story's acceptance criteria]
```

**Suite guidelines:**
- `build` — compilation, dependency checks
- `integration` — single MCP tool calls, verify output format
- `e2e` — multi-tool workflows, verify AP state

**Test case ID format:**
- Build: `TC-BUILD-XXX`
- Integration: `TC-INT-XXX`
- E2E: `TC-E2E-XXX`

### Step 4: Update Story File

Update the story's **Status** section with test references:
```markdown
- Tests: TC-INT-001, TC-E2E-001
```

### Step 5: Report

Show the user:
- Test case files created
- What each test validates
- Suggest: `/ci-run` to execute tests

---

## EXAMPLE

For a story about adding a `runCommand` tool:

```yaml
id: TC-INT-001
name: Run arbitrary command on AP
suite: integration
story: STORY-001
priority: 5
timeout: 30000
dependencies: []

steps:
  - name: Execute 'get devicename' via runCommand
    mcp_tool: runCommand
    mcp_args:
      command: "get devicename"
    expectPatterns:
      - "devicename"
    rejectPatterns:
      - "Unknown tool"
      - "Error executing"

  - name: Execute invalid command
    mcp_tool: runCommand
    mcp_args:
      command: "invalid_command_xyz"
    expectPatterns:
      - "."
    rejectPatterns:
      - "Unknown tool"

criteria: |
  Verify the runCommand MCP tool:
  - Can execute a valid rkscli command and return output
  - Handles invalid commands gracefully without crashing
  - Returns raw AP output to the caller
```

---

## OUTPUT

Paths to created test case files.
```
