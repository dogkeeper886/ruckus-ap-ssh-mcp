#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

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
      description: 'Get WiFi channel information for both interfaces (wifi0 and wifi1)',
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
  // Debug environment
  console.error('MCP Server Debug - Working directory:', process.cwd());
  console.error('MCP Server Debug - Environment variables:');
  console.error('  AP_IP:', process.env.AP_IP);
  console.error('  AP_USERNAME:', process.env.AP_USERNAME);
  console.error('  AP_PASSWORD:', process.env.AP_PASSWORD ? '[SET]' : '[NOT SET]');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Ruckus AP SSH MCP server started');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}