import { executeSSHCommand } from '../utils/sshClient.js';
import type { WlanListEntry } from '../types.js';

function parseWlanList(output: string): WlanListEntry[] {
  const entries: WlanListEntry[] = [];

  const lines = output.split('\n');

  for (const line of lines) {
    // Match lines that start with a wlan name (e.g., "wlan0", "recovery-ssid")
    // Skip header line and separator line
    const match = line.match(/^(\S+)\s+(up|down)\s+(AP)\s+(wlan\d+)\s+(\d+)\s+([0-9a-f:]+)\s+(.+)/i);
    if (!match) continue;

    entries.push({
      name: match[1],
      status: match[2] as 'up' | 'down',
      type: match[3],
      wlanID: match[4],
      radioID: parseInt(match[5], 10),
      bssid: match[6],
      ssid: match[7].trim(),
    });
  }

  return entries;
}

export async function getWlanList() {
  try {
    const output = await executeSSHCommand('get wlanlist');

    if (!output || output.length === 0) {
      throw new Error('No output received from get wlanlist command');
    }

    const wlanList = parseWlanList(output);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(wlanList, null, 2)
      }]
    };

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting WLAN list: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
