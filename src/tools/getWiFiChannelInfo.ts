import { executeSSHCommand } from '../utils/sshClient.js';
import type { WiFiChannelInfo } from '../types.js';

function parseChannelInfo(output: string, interfaceName: string): WiFiChannelInfo['wifi0'] | WiFiChannelInfo['wifi1'] {
  // Check for radio off status
  if (output.includes('Radio Off')) {
    return {
      radioEnabled: false,
      channel: null,
      status: 'Radio Off (no WLAN is enabled)'
    };
  }
  
  // Check for invalid interface error
  if (output.includes('Invalid radio interface name')) {
    return {
      radioEnabled: false,
      channel: null,
      status: 'Invalid radio interface'
    };
  }
  
  // Parse the channel number if radio is on
  // Expected format: "Channel: X" or similar
  const channelMatch = output.match(/Channel[:\s]+(\d+)/i);
  
  if (channelMatch) {
    return {
      radioEnabled: true,
      channel: parseInt(channelMatch[1], 10),
      status: 'OK'
    };
  }
  
  // If we have an OK response but can't parse the channel
  if (output.includes('OK')) {
    return {
      radioEnabled: true,
      channel: null,
      status: 'OK - channel information not available'
    };
  }
  
  // Default case - couldn't parse the output
  return {
    radioEnabled: false,
    channel: null,
    status: 'Unknown status'
  };
}

export async function getWiFiChannelInfo() {
  try {
    // Execute both commands in parallel for better performance
    const [wifi0Output, wifi1Output] = await Promise.all([
      executeSSHCommand('get channel wifi0'),
      executeSSHCommand('get channel wifi1')
    ]);
    
    // Parse the responses
    const channelInfo: WiFiChannelInfo = {
      wifi0: parseChannelInfo(wifi0Output, 'wifi0'),
      wifi1: parseChannelInfo(wifi1Output, 'wifi1')
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(channelInfo, null, 2)
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting WiFi channel info: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}