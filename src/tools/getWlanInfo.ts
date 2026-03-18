import { executeSSHCommand } from '../utils/sshClient.js';
import type { WlanInfo, WlanInterfaceInfo } from '../types.js';

function parseWlanBlocks(output: string): WlanInfo {
  const wlanInfo: WlanInfo = {};

  // Split output into blocks starting with "wlanN"
  const blocks = output.split(/(?=^wlan\d+\s)/m);

  for (const block of blocks) {
    const headerMatch = block.match(/^(wlan\d+)\s+SSID\s*\/\s*BSSID:\s*(.+?)\s*\/\s*([0-9a-f:]+)/i);
    if (!headerMatch) continue;

    const wlanName = headerMatch[1];
    const ssid = headerMatch[2].trim();
    const bssid = headerMatch[3].trim();

    const channelMatch = block.match(/Channel:\s*(\d+)/i);
    const channel = channelMatch ? parseInt(channelMatch[1], 10) : null;

    const protocolMatch = block.match(/Protocol Version:\s*(.+)/i);
    const security = protocolMatch ? protocolMatch[1].trim() : '';

    const authMatch = block.match(/Auth:\s*(.+)/i);
    const auth = authMatch ? authMatch[1].trim() : '';

    const cipherMatch = block.match(/Cipher Algorithm:\s*(.+)/i);
    const cipher = cipherMatch ? cipherMatch[1].trim() : '';

    let firewallProfile: string | null = null;
    if (block.includes('FIREWALL PROFILE is not attached')) {
      firewallProfile = null;
    } else {
      const fwMatch = block.match(/FIREWALL PROFILE:\s*(.+)/i);
      if (fwMatch) {
        firewallProfile = fwMatch[1].trim();
      }
    }

    const entry: WlanInterfaceInfo = {
      ssid,
      bssid,
      channel,
      security,
      auth,
      cipher,
      firewallProfile,
    };

    wlanInfo[wlanName] = entry;
  }

  return wlanInfo;
}

export async function getWlanInfo() {
  try {
    const output = await executeSSHCommand('get wlaninfo');

    if (!output || output.length === 0) {
      throw new Error('No output received from get wlaninfo command');
    }

    const wlanInfo = parseWlanBlocks(output);

    if (Object.keys(wlanInfo).length === 0) {
      // Could be an AP with no WLANs configured
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({}, null, 2)
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(wlanInfo, null, 2)
      }]
    };

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting WLAN info: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
