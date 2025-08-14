import { executeSSHCommand } from '../utils/sshClient.js';
import type { SerialInfo } from '../types.js';

export async function getSerialNumber() {
  try {
    // Connect without command to get login banner
    const output = await executeSSHCommand('');
    
    // Parse serial and model from banner
    // Example: "Ruckus T670 Multimedia Hotzone Wireless AP: 952443000155"
    const bannerMatch = output.match(/Ruckus (.+) AP:\s*(\d+)/);
    
    if (bannerMatch) {
      const serialInfo: SerialInfo = {
        model: bannerMatch[1].trim(),
        serial: bannerMatch[2]
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(serialInfo, null, 2)
        }]
      };
    }
    
    // Alternative parsing - look for serial in any line
    const serialMatch = output.match(/:\s*(\d{12,})/);
    if (serialMatch) {
      const serialInfo: SerialInfo = {
        model: 'Unknown',
        serial: serialMatch[1]
      };
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(serialInfo, null, 2)
        }]
      };
    }
    
    // Return raw output for debugging if no pattern matches
    throw new Error(`Serial number not found in output. Raw output: ${output.substring(0, 500)}`);
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting serial number: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}