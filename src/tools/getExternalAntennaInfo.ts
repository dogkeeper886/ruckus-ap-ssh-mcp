import { executeSSHCommand } from '../utils/sshClient.js';
import type { ExternalAntennaInfo } from '../types.js';

function extractMode(text: string): string {
  const match = text.match(/External Antenna Mode:\s*(\w+)/i);
  return match ? match[1].trim() : 'Unknown';
}

function extractGain(text: string): string {
  const match = text.match(/External Antenna Gain:\s*(.+)/i);
  return match ? match[1].trim() : 'Unknown';
}

export async function getExternalAntennaInfo() {
  try {
    // Execute all 4 commands in parallel for better performance
    const [wifi0Mode, wifi0Gain, wifi1Mode, wifi1Gain] = await Promise.all([
      executeSSHCommand('get extant wifi0'),
      executeSSHCommand('get extantgain wifi0'),
      executeSSHCommand('get extant wifi1'),
      executeSSHCommand('get extantgain wifi1')
    ]);
    
    // Parse the responses
    const antennaInfo: ExternalAntennaInfo = {
      wifi0: {
        mode: extractMode(wifi0Mode),
        gain: extractGain(wifi0Gain)
      },
      wifi1: {
        mode: extractMode(wifi1Mode),
        gain: extractGain(wifi1Gain)
      }
    };
    
    // Validate that we got some data
    if (antennaInfo.wifi0.mode === 'Unknown' && antennaInfo.wifi1.mode === 'Unknown') {
      throw new Error('Unable to parse external antenna information');
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(antennaInfo, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting external antenna info: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}