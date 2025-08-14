import { executeSSHCommand } from '../utils/dockerSSH.js';
import type { ACXStatus } from '../types.js';

function extractValue(text: string, key: string): string {
  const regex = new RegExp(`${key}\\s*(.+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function parseHeartbeatInterval(text: string): number {
  const match = text.match(/ACX heartbeat intervals:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

export async function getACXStatus() {
  try {
    const output = await executeSSHCommand('get acx');
    
    if (!output || output.length === 0) {
      throw new Error('No output received from get acx command');
    }
    
    // Parse ACX output into structured data
    const status: ACXStatus = {
      serviceEnabled: output.includes('ACX Service is enabled'),
      managedByACX: output.includes('AP is managed by ACX'),
      state: extractValue(output, 'State:'),
      connectionStatus: extractValue(output, 'Connection status:'),
      serverList: extractValue(output, 'Server List:'),
      configUpdateState: extractValue(output, 'Configuration Update State:'),
      heartbeatInterval: parseHeartbeatInterval(output),
      certValidation: extractValue(output, 'Controller Cert Validation Result:')
    };
    
    // Add some validation
    if (!status.state && !status.connectionStatus) {
      throw new Error(`Unable to parse ACX status. Raw output: ${output.substring(0, 300)}`);
    }
    
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
        text: `Error getting ACX status: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}