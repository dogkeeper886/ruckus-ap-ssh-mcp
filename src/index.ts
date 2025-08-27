#!/usr/bin/env node

import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Look for .env file in the project root (one level up from src, or current dir for Docker)
dotenv.config({ path: join(__dirname, '..', '.env') });
// Fallback for Docker container where .env might be in the same directory as dist
dotenv.config({ path: join(__dirname, '.env') });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { getSerialNumber } from './tools/getSerialNumber.js';
import { getACXStatus } from './tools/getACXStatus.js';
import { getExternalAntennaInfo } from './tools/getExternalAntennaInfo.js';
import { getClientAdmissionControl } from './tools/getClientAdmissionControl.js';
import { getWiFiChannelInfo } from './tools/getWiFiChannelInfo.js';

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
    },
    {
      name: 'getExternalAntennaInfo',
      description: 'Get external antenna mode and gain information for both WiFi interfaces',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'getClientAdmissionControl',
      description: 'Get client admission control configuration for both WiFi interfaces',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'getWiFiChannelInfo',
      description: 'Get WiFi channel information for all interfaces (wifi0: 2.4GHz, wifi1: 5GHz, wifi2: 6GHz or second 5GHz if available)',
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
      case 'getExternalAntennaInfo':
        return await getExternalAntennaInfo();
      case 'getClientAdmissionControl':
        return await getClientAdmissionControl();
      case 'getWiFiChannelInfo':
        return await getWiFiChannelInfo();
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}