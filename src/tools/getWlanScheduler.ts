import { executeSSHCommand } from '../utils/sshClient.js';
import type { WlanSchedulerInfo, WlanScheduleEntry, DaySchedule } from '../types.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function hexToStatus(hex: string): string {
  const val = parseInt(hex, 16);
  if (val === 0xF) return 'on';
  if (val === 0x0) return 'off';
  // Decode individual quarters (LSB-first): bit0=Q1(:00), bit1=Q2(:15), bit2=Q3(:30), bit3=Q4(:45)
  const quarters = [
    val & 1 ? 'on' : 'off',
    (val >> 1) & 1 ? 'on' : 'off',
    (val >> 2) & 1 ? 'on' : 'off',
    (val >> 3) & 1 ? 'on' : 'off',
  ];
  return quarters.join('/');
}

function parseSchedulerOutput(output: string): WlanScheduleEntry {
  const profileMatch = output.match(/Profile ID=(\d+)/);
  const profileId = profileMatch ? parseInt(profileMatch[1], 10) : null;

  const tzMatch = output.match(/Timezone\s*=\s*(.+)/);
  const timezone = tzMatch ? tzMatch[1].trim() : '';

  const schedule: WlanScheduleEntry['schedule'] = {
    Sun: {}, Mon: {}, Tue: {}, Wed: {}, Thu: {}, Fri: {}, Sat: {},
  };

  for (const day of DAYS) {
    const dayRegex = new RegExp(`\\|${day}\\|([^\\n]+)`, 'i');
    const dayMatch = output.match(dayRegex);
    if (!dayMatch) continue;

    // Extract hex values between pipes
    const cells = dayMatch[1].split('|').map(c => c.trim()).filter(c => c.length > 0);

    const daySchedule: DaySchedule = {};
    for (let hour = 0; hour < Math.min(cells.length, 24); hour++) {
      daySchedule[String(hour)] = hexToStatus(cells[hour]);
    }
    schedule[day] = daySchedule;
  }

  return { profileId, timezone, schedule };
}

function discoverWlanNames(wlanInfoOutput: string): string[] {
  const names: string[] = [];
  const matches = wlanInfoOutput.matchAll(/^(wlan\d+)\s/gm);
  for (const match of matches) {
    names.push(match[1]);
  }
  return names;
}

export async function getWlanScheduler() {
  try {
    // Discover active WLANs
    const wlanInfoOutput = await executeSSHCommand('get wlaninfo');
    const wlanNames = discoverWlanNames(wlanInfoOutput);

    if (wlanNames.length === 0) {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({}, null, 2)
        }]
      };
    }

    // Fetch scheduler for each WLAN in parallel
    const schedulerOutputs = await Promise.all(
      wlanNames.map(name => executeSSHCommand(`get scheduler ${name}`))
    );

    const result: WlanSchedulerInfo = {};
    for (let i = 0; i < wlanNames.length; i++) {
      result[wlanNames[i]] = parseSchedulerOutput(schedulerOutputs[i]);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error getting WLAN scheduler: ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
