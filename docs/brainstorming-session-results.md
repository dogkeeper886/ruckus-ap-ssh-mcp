# MCP SSH Tool for Ruckus AP - Brainstorming Session

**Date:** 2025-08-14  
**Facilitator:** Mary (Business Analyst)

## Executive Summary

**Session Topic:** Building an MCP (Model Context Protocol) tool for SSH connectivity to Ruckus Access Points for status monitoring and configuration management

**Core Challenge:** SSH encryption compatibility across different Ruckus firmware versions

**Proposed Solution Framework:** Docker-based MCP server using modern SDK architecture, integrated with Claude Code

**Key Constraints:**
- SSH encryption varies between firmware versions
- Need to use Docker container (dogkeeper886/ssh-sshrsa) for compatibility
- Must integrate with Claude Code as MCP server
- Preference for modern framework/SDK approach

---

## Session Progress

### Technique 1: First Principles Thinking
*Breaking down the fundamental requirements*

**User's Core Fundamentals:**
1. **Authentication:** All Ruckus AP models use username/password authentication (consistent across models)
2. **Command Scope:** Focus on specific CLI commands initially, not trying to support every possible command
3. **Connection Method:** Must handle SSH encryption differences via Docker container approach

**Primary Use Cases Identified:**
1. **Get Serial Number:** Login and extract serial from the banner (e.g., "Ruckus T670 Multimedia Hotzone Wireless AP: 952443000155")
   - Username: super
   - Password: (varies per deployment)
   
2. **Get ACX Status:** Execute `get acx` command to retrieve:
   - ACX Service status
   - Connection status with controller
   - Server List (e.g., device.dev.ruckus.cloud)
   - Configuration Update State
   - Heartbeat intervals
   - Certificate validation status

### Technique 2: Role Playing (DevOps Perspective)
*Operational requirements and deployment considerations*

**Scope Clarification:**
- **Personal IDE tool** - Not production/enterprise deployment
- **Single AP connection** - No multi-AP management needed
- **Simple configuration via environment variables:**
  - `AP_IP` - Target AP IP address
  - `AP_USERNAME` - SSH username (typically "super")
  - `AP_PASSWORD` - SSH password
- **Core responsibilities:**
  - SSH connection handling (via Docker container)
  - Data parsing and extraction
  - Return structured data to IDE

### Technique 3: Morphological Analysis
*Component architecture and technical choices*

**Selected Architecture Components:**
1. **MCP Server Framework:** Claude's MCP SDK (TypeScript/JavaScript) - Option A
2. **SSH Connection Method:** Docker exec commands from MCP server - Option A
3. **Data Return Format:** Parsed JSON structure - Option B

**Architecture Implications:**
- TypeScript/Node.js based implementation
- Use `child_process.exec()` or similar to run Docker commands
- Parse CLI output into structured JSON responses
- Clean, type-safe interface for Claude Code integration

### Technique 4: "What If" Scenarios
*Addressing potential challenges*

**Challenge: Docker Container Startup Overhead**

**User's Approach - Pragmatic Design Philosophy:**
- **Phase 1 (MVP):** Simple approach - new Docker container per command
  - Acceptable latency for personal tool use
  - Simpler implementation, easier to debug
  - No connection state management complexity
  
- **Phase 2 (Future Enhancement):** Connection persistence
  - Maintain SSH session for a period after first command
  - Only if performance becomes an issue
  - Not over-engineering the initial solution

**Design Principle:** "Start simple, optimize when needed"

### Technique 5: Convergent Thinking
*Consolidating ideas into action plan*

**Tool Name:** `ruckus-ap-ssh-mcp`

**Priority Implementation Order:**
1. **getSerialNumber()** - Connect via SSH and extract serial number from login banner
2. **getACXStatus()** - Execute "get acx" command and parse output to JSON

**Future Functions (Phase 2):**
- executeCommand(cmd) - Generic command executor
- getConnectionStatus() - Quick health check
- Additional status commands as needed

---

## Implementation Plan

### A. Step-by-Step Implementation Guide

**Phase 1: Project Setup**
1. Initialize new Node.js project: `npm init -y`
2. Install MCP SDK: `npm install @modelcontextprotocol/sdk`
3. Install TypeScript and types: `npm install -D typescript @types/node`
4. Create tsconfig.json for TypeScript configuration
5. Set up build scripts in package.json

**Phase 2: Core Implementation**
1. Create MCP server structure with tool definitions
2. Implement Docker command wrapper for SSH execution
3. Create parser functions for serial number extraction
4. Create parser for ACX status output to JSON
5. Add error handling for connection failures

**Phase 3: Docker Integration**
1. Test Docker container locally: `docker run --rm -it dogkeeper886/ssh-sshrsa ssh <AP_IP>`
2. Implement command builder for Docker exec
3. Add timeout handling for SSH connections
4. Test with actual Ruckus AP

**Phase 4: Packaging & Deployment**
1. Create Dockerfile for MCP server
2. Set up environment variable configuration
3. Test with Claude Code: `claude mcp add ruckus-ap-ssh -- docker run ...`
4. Document usage and configuration

### B. File Structure and Code Skeleton

```
ruckus-ap-ssh-mcp/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── tools/
│   │   ├── getSerialNumber.ts
│   │   └── getACXStatus.ts
│   ├── utils/
│   │   ├── dockerSSH.ts   # Docker command execution
│   │   └── parsers.ts     # Output parsing functions
│   └── types.ts           # TypeScript interfaces
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**Example: index.ts**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getSerialNumber } from './tools/getSerialNumber.js';
import { getACXStatus } from './tools/getACXStatus.js';

const server = new Server({
  name: 'ruckus-ap-ssh-mcp',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {}
  }
});

// Register tools
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'getSerialNumber',
      description: 'Get Ruckus AP serial number',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'getACXStatus',
      description: 'Get ACX management status',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
  const { name } = request.params;
  
  switch(name) {
    case 'getSerialNumber':
      return await getSerialNumber();
    case 'getACXStatus':
      return await getACXStatus();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### C. Docker Integration Approach

**dockerSSH.ts - SSH Execution Wrapper**
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SSHConfig {
  host: string;
  username: string;
  password: string;
}

export async function executeSSHCommand(
  command: string = ''
): Promise<string> {
  const config: SSHConfig = {
    host: process.env.AP_IP || '',
    username: process.env.AP_USERNAME || 'super',
    password: process.env.AP_PASSWORD || ''
  };

  // Build Docker command
  const dockerCmd = `docker run --rm -i dogkeeper886/ssh-sshrsa ` +
    `sshpass -p "${config.password}" ` +
    `ssh -o StrictHostKeyChecking=no ` +
    `${config.username}@${config.host} ` +
    `"${command}"`;

  try {
    const { stdout, stderr } = await execAsync(dockerCmd, {
      timeout: 30000 // 30 second timeout
    });
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`SSH Error: ${stderr}`);
    }
    
    return stdout;
  } catch (error) {
    throw new Error(`Failed to execute SSH command: ${error.message}`);
  }
}
```

**getSerialNumber.ts - Tool Implementation**
```typescript
import { executeSSHCommand } from '../utils/dockerSSH';

export async function getSerialNumber() {
  try {
    // Connect without command to get banner
    const output = await executeSSHCommand('');
    
    // Parse serial from banner
    // Example: "Ruckus T670 Multimedia Hotzone Wireless AP: 952443000155"
    const serialMatch = output.match(/Ruckus .* AP: (\d+)/);
    
    if (serialMatch) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            serial: serialMatch[1],
            model: serialMatch[0].split(':')[0]
          }, null, 2)
        }]
      };
    }
    
    throw new Error('Serial number not found in output');
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}
```

**getACXStatus.ts - ACX Parser**
```typescript
import { executeSSHCommand } from '../utils/dockerSSH';

interface ACXStatus {
  serviceEnabled: boolean;
  managedByACX: boolean;
  state: string;
  connectionStatus: string;
  serverList: string;
  configUpdateState: string;
  heartbeatInterval: number;
  certValidation: string;
}

export async function getACXStatus() {
  try {
    const output = await executeSSHCommand('get acx');
    
    // Parse ACX output
    const status: ACXStatus = {
      serviceEnabled: output.includes('ACX Service is enabled'),
      managedByACX: output.includes('AP is managed by ACX'),
      state: extractValue(output, 'State:'),
      connectionStatus: extractValue(output, 'Connection status:'),
      serverList: extractValue(output, 'Server List:'),
      configUpdateState: extractValue(output, 'Configuration Update State:'),
      heartbeatInterval: parseInt(extractValue(output, 'ACX heartbeat intervals:')) || 0,
      certValidation: extractValue(output, 'Controller Cert Validation Result:')
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(status, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}

function extractValue(text: string, key: string): string {
  const regex = new RegExp(`${key}\\s*(.+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}
```

**Dockerfile for MCP Server**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built JavaScript files
COPY dist/ ./dist/

# Set environment variables
ENV AP_IP=""
ENV AP_USERNAME="super"
ENV AP_PASSWORD=""

# Run MCP server
CMD ["node", "dist/index.js"]
```

**Docker Compose Integration (optional)**
```yaml
version: '3.8'
services:
  ruckus-mcp:
    build: .
    environment:
      - AP_IP=${AP_IP}
      - AP_USERNAME=${AP_USERNAME}
      - AP_PASSWORD=${AP_PASSWORD}
    stdin_open: true
    tty: true
```

**Claude Code Integration Command**
```bash
# Add MCP server to Claude Code
claude mcp add ruckus-ap-ssh -- docker run --rm -i \
  -e AP_IP=192.168.1.100 \
  -e AP_USERNAME=super \
  -e AP_PASSWORD=yourpassword \
  -v /var/run/docker.sock:/var/run/docker.sock \
  your-dockerhub/ruckus-ap-ssh-mcp
```

---

## Next Steps & Recommendations

### Immediate Actions
1. **Create GitHub repository** for version control
2. **Set up TypeScript project** with MCP SDK
3. **Test Docker SSH container** with your Ruckus AP
4. **Implement MVP** with two core functions
5. **Package as Docker image** for Claude Code

### Testing Strategy
1. Unit tests for parser functions
2. Integration test with mock SSH responses
3. End-to-end test with actual Ruckus AP
4. Claude Code integration test

### Future Enhancements
1. Connection persistence for multiple commands
2. Additional status commands (clients, power, etc.)
3. Configuration commands (with safety checks)
4. Batch command execution
5. Connection health monitoring

### Security Considerations
1. Never log passwords in debug output
2. Use Docker secrets for production
3. Implement connection timeout
4. Add rate limiting for commands
5. Validate all input parameters

---

## Session Reflection

**What Worked Well:**
- Clear scope definition early on
- Pragmatic "don't over-engineer" approach
- Focus on specific, real use cases
- Concrete technical decisions

**Key Insights:**
- Docker container approach solves SSH compatibility elegantly
- Simple MVP first, optimize later if needed
- Personal tool doesn't need enterprise features
- TypeScript MCP SDK provides clean integration

**Follow-up Questions for Next Session:**
1. How to handle AP connection errors gracefully?
2. Should we cache serial numbers?
3. Would a config file be useful for multiple APs later?
4. Integration with other Ruckus management tools?
