#!/usr/bin/env node

import { spawn } from 'child_process';

// Test MCP server tools
async function testMCP() {
  console.log('Testing MCP Server...');
  
  const env = {
    ...process.env,
    AP_IP: '192.168.6.162',
    AP_USERNAME: 'admin',
    AP_PASSWORD: 'mU!62%*P0WGli6%q'
  };

  const mcpProcess = spawn('node', ['dist/index.js'], { env, stdio: 'pipe' });
  
  // Test tools/list
  console.log('Testing tools/list...');
  mcpProcess.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n');

  setTimeout(() => {
    console.log('Testing getSerialNumber...');
    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'getSerialNumber'
      }
    }) + '\n');
  }, 1000);

  setTimeout(() => {
    console.log('Testing getACXStatus...');
    mcpProcess.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'getACXStatus'
      }
    }) + '\n');
  }, 2000);

  mcpProcess.stdout.on('data', (data) => {
    console.log('Response:', data.toString());
  });

  mcpProcess.stderr.on('data', (data) => {
    console.log('Error:', data.toString());
  });

  setTimeout(() => {
    mcpProcess.kill();
    console.log('Test completed');
  }, 60000);
}

testMCP().catch(console.error);