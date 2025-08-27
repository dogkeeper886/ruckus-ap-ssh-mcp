import { executeSSHCommand } from '../utils/sshClient.js';
import type { WiFiChannelInfo } from '../types.js';

interface WifiInterfaceInfo {
  radioEnabled: boolean;
  channel: number | null;
  status: string;
  band?: string;
}

function parseChannelInfo(output: string, interfaceName: string): WifiInterfaceInfo {
  // Check for radio off status
  if (output.includes('Radio Off')) {
    return {
      radioEnabled: false,
      channel: null,
      status: 'Radio Off (no WLAN is enabled)'
    };
  }
  
  // Check for invalid interface error (wifi2 might not exist on all APs)
  if (output.includes('Invalid radio interface name')) {
    return {
      radioEnabled: false,
      channel: null,
      status: 'Invalid radio interface (not available on this AP)'
    };
  }
  
  // Parse the channel number and frequency if radio is on
  // Expected format: "Channel: X (Y Mhz)" or "Channel: X"
  const channelMatch = output.match(/Channel[:\s]+(\d+)(?:\s*\((\d+)\s*Mhz\))?/i);
  
  if (channelMatch) {
    const channel = parseInt(channelMatch[1], 10);
    const frequency = channelMatch[2] ? parseInt(channelMatch[2], 10) : null;
    
    // Determine band based on frequency (preferred) or interface/channel fallback
    let band: string | undefined;
    if (frequency) {
      // Use frequency to determine band accurately
      if (frequency >= 2400 && frequency <= 2500) {
        band = '2.4GHz';
      } else if (frequency >= 5000 && frequency <= 5900) {
        band = '5GHz';
      } else if (frequency >= 5925 && frequency <= 7125) {
        band = '6GHz';
      } else {
        band = 'Unknown';
      }
    } else {
      // Fallback to interface-based detection
      if (interfaceName === 'wifi0') {
        band = '2.4GHz';
      } else if (interfaceName === 'wifi1') {
        band = '5GHz';
      } else if (interfaceName === 'wifi2') {
        // Without frequency, assume it's likely 6GHz but could be second 5GHz
        band = '5GHz/6GHz';
      }
    }
    
    return {
      radioEnabled: true,
      channel,
      status: 'OK',
      band
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
    // Execute all three commands in parallel for better performance
    const [wifi0Output, wifi1Output, wifi2Output] = await Promise.all([
      executeSSHCommand('get channel wifi0'),
      executeSSHCommand('get channel wifi1'),
      executeSSHCommand('get channel wifi2')
    ]);
    
    // Parse the responses
    const channelInfo: WiFiChannelInfo = {
      wifi0: parseChannelInfo(wifi0Output, 'wifi0'),
      wifi1: parseChannelInfo(wifi1Output, 'wifi1')
    };
    
    // Only add wifi2 if it's not an invalid interface
    const wifi2Info = parseChannelInfo(wifi2Output, 'wifi2');
    if (!wifi2Info.status.includes('Invalid radio interface')) {
      channelInfo.wifi2 = wifi2Info;
    }
    
    // Validate that we got some meaningful response
    if (!wifi0Output && !wifi1Output && !wifi2Output) {
      throw new Error('No output received from channel commands');
    }
    
    // Validate that at least one interface returned a valid status
    const hasValidStatus = 
      (channelInfo.wifi0 && channelInfo.wifi0.status !== 'Unknown status') ||
      (channelInfo.wifi1 && channelInfo.wifi1.status !== 'Unknown status') ||
      (channelInfo.wifi2 && channelInfo.wifi2.status !== 'Unknown status');
    
    if (!hasValidStatus) {
      throw new Error('Unable to parse channel information from any interface');
    }
    
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