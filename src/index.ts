#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
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

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'getSerialNumber',
      description: 'Get Ruckus AP serial number and model information from SSH connection',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'getACXStatus',
      description: 'Get ACX management status and connection details from Ruckus AP',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  
  try {
    switch(name) {
      case 'getSerialNumber':
        return await getSerialNumber();
      case 'getACXStatus':
        return await getACXStatus();
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Ruckus AP SSH MCP server started');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}