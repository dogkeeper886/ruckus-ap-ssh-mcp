import { executeSSHCommand } from '../utils/sshClient.js';
import type { ClientAdmissionControlInfo } from '../types.js';

function parseAdmissionControl(text: string): {
  enabled: boolean;
  radioLoadThreshold: number;
  clientCountThreshold: number;
  clientThroughputThreshold: number;
} {
  const enabled = !text.includes('Client Admission Control: Disabled');
  
  const radioLoadMatch = text.match(/Radio Load threshold:\s*(\d+)\s*%/);
  const clientCountMatch = text.match(/Client Count threshold:\s*(\d+)\s*clients/);
  const throughputMatch = text.match(/Client throughput threshold:\s*(\d+\.?\d*)\s*Mbps/);
  
  return {
    enabled,
    radioLoadThreshold: radioLoadMatch ? parseInt(radioLoadMatch[1], 10) : 0,
    clientCountThreshold: clientCountMatch ? parseInt(clientCountMatch[1], 10) : 0,
    clientThroughputThreshold: throughputMatch ? parseFloat(throughputMatch[1]) : 0
  };
}

export async function getClientAdmissionControl() {
  try {
    // Execute both commands in parallel for better performance
    const [wifi0Output, wifi1Output] = await Promise.all([
      executeSSHCommand('get admctl wifi0'),
      executeSSHCommand('get admctl wifi1')
    ]);
    
    // Parse the responses
    const admissionControlInfo: ClientAdmissionControlInfo = {
      wifi0: parseAdmissionControl(wifi0Output),
      wifi1: parseAdmissionControl(wifi1Output)
    };
    
    // Validate that we got some data
    if (!wifi0Output.includes('Client Admission Control') || !wifi1Output.includes('Client Admission Control')) {
      throw new Error('Unable to parse client admission control information');
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(admissionControlInfo, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting client admission control info: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}