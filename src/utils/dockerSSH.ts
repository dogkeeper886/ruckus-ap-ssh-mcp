import { spawn } from 'child_process';
import type { SSHConfig } from '../types.js';

export async function executeSSHCommand(command: string = ''): Promise<string> {
  const config: SSHConfig = {
    host: process.env.AP_IP || '',
    username: process.env.AP_USERNAME || 'admin',
    password: process.env.AP_PASSWORD || ''
  };

  if (!config.host) {
    throw new Error('AP_IP environment variable is required');
  }
  if (!config.password) {
    throw new Error('AP_PASSWORD environment variable is required');
  }

  return new Promise((resolve, reject) => {
    // Build Docker command for interactive SSH
    const dockerArgs = [
      'run', '--rm', '-i',
      'dogkeeper886/ssh-sshrsa',
      'ssh',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      '-o', 'ConnectTimeout=30',
      `${config.username}@${config.host}`
    ];

    const dockerProcess = spawn('docker', dockerArgs);
    
    let output = '';
    let errorOutput = '';
    let authStep = 'waiting_for_login';
    
    // Set timeout
    const timeout = setTimeout(() => {
      dockerProcess.kill();
      reject(new Error('SSH connection timeout'));
    }, 45000);

    dockerProcess.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      output += text;
      
      // Handle authentication steps
      if (authStep === 'waiting_for_login' && text.includes('Please login:')) {
        authStep = 'sending_username';
        dockerProcess.stdin.write(`${config.username}\n`);
      } else if (authStep === 'sending_username' && text.includes('password')) {
        authStep = 'sending_password';
        dockerProcess.stdin.write(`${config.password}\n`);
      } else if (authStep === 'sending_password' && text.includes('rkscli:')) {
        authStep = 'authenticated';
        if (command) {
          // Send the command
          dockerProcess.stdin.write(`${command}\n`);
          authStep = 'command_sent';
        } else {
          // Just getting banner info, close connection
          dockerProcess.stdin.write('exit\n');
        }
      } else if (authStep === 'command_sent' && text.includes('rkscli:')) {
        // Command completed, exit
        dockerProcess.stdin.write('exit\n');
      }
    });

    dockerProcess.stderr.on('data', (data: Buffer) => {
      errorOutput += data.toString();
    });

    dockerProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`SSH process exited with code ${code}. Error: ${errorOutput}`));
      }
    });

    dockerProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start Docker process: ${error.message}`));
    });
  });
}

export function parseTextOutput(output: string, startPattern: string, endPattern?: string): string {
  const lines = output.split('\n');
  let capturing = false;
  let result = '';
  
  for (const line of lines) {
    if (line.includes(startPattern)) {
      capturing = true;
      if (!endPattern) {
        return line.trim();
      }
    }
    
    if (capturing) {
      result += line + '\n';
      if (endPattern && line.includes(endPattern)) {
        break;
      }
    }
  }
  
  return result.trim();
}