import { executeSSHCommand } from '../utils/sshClient.js';

export async function runCommand(command: string) {
  try {
    const output = await executeSSHCommand(command);

    return {
      content: [{
        type: 'text',
        text: output
      }]
    };

  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error executing command '${command}': ${error instanceof Error ? error.message : String(error)}`
      }],
      isError: true
    };
  }
}
