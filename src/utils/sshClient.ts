import { Client } from 'ssh2';
import type { SSHConfig } from '../types.js';

export interface SSHClientOptions {
  debug?: boolean;
  timeout?: number;
}

export class RuckusSSHClient {
  private config: SSHConfig;
  private options: SSHClientOptions;
  private client: Client | null = null;
  
  constructor(config?: Partial<SSHConfig>, options: SSHClientOptions = {}) {
    this.config = {
      host: config?.host || process.env.AP_IP || '192.168.6.162',
      username: config?.username || process.env.AP_USERNAME || 'admin',
      password: config?.password || process.env.AP_PASSWORD || ''
    };
    
    this.options = {
      debug: options.debug ?? false,
      timeout: options.timeout ?? 10000
    };
    
    if (!this.config.password) {
      throw new Error('AP_PASSWORD environment variable is required');
    }
  }
  
  private log(message: string, data?: any): void {
    if (this.options.debug) {
      console.log(`[SSH] ${message}`, data || '');
    }
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client();
      
      this.client.on('ready', () => {
        this.log('Connected successfully');
        resolve();
      });
      
      this.client.on('error', (err) => {
        this.log('Connection error', err.message);
        reject(new Error(`SSH connection failed: ${err.message}`));
      });
      
      this.log(`Connecting to ${this.config.host}`);
      this.client.connect({
        host: this.config.host,
        username: this.config.username,
        password: this.config.password,
        readyTimeout: this.options.timeout
      });
    });
  }
  
  async executeCommand(command?: string): Promise<string> {
    if (!this.client) {
      await this.connect();
    }
    
    return new Promise((resolve, reject) => {
      if (!this.client) {
        return reject(new Error('Not connected'));
      }
      
      this.client.shell((err, stream) => {
        if (err) {
          return reject(new Error(`Failed to start shell: ${err.message}`));
        }
        
        let output = '';
        let state: 'login' | 'password' | 'authenticated' | 'done' = 'login';
        let commandSent = false;
        
        const cleanup = () => {
          stream.end();
          this.client?.end();
          this.client = null;
        };
        
        stream.on('close', () => {
          this.log('Shell closed');
          cleanup();
          resolve(output);
        });
        
        stream.on('data', (data: Buffer) => {
          const text = data.toString();
          output += text;
          
          this.log(`Received (state=${state})`, text.substring(0, 100));
          
          // State machine for Ruckus AP authentication
          switch (state) {
            case 'login':
              if (text.includes('login:')) {
                this.log('Sending username');
                stream.write(`${this.config.username}\n`);
                state = 'password';
              }
              break;
              
            case 'password':
              if (text.includes('password')) {
                this.log('Sending password');
                stream.write(`${this.config.password}\n`);
                state = 'authenticated';
              }
              break;
              
            case 'authenticated':
              if (text.includes('rkscli:')) {
                if (command && !commandSent) {
                  this.log(`Executing command: ${command}`);
                  stream.write(`${command}\n`);
                  commandSent = true;
                } else if (!command || commandSent) {
                  // No command or command completed, exit
                  setTimeout(() => {
                    stream.write('exit\n');
                    state = 'done';
                  }, command ? 100 : 1000); // Wait longer if no command to capture banner
                }
              }
              break;
          }
        });
        
        // Safety timeout
        setTimeout(() => {
          if (state !== 'done') {
            this.log('Timeout reached, closing connection');
            cleanup();
            resolve(output);
          }
        }, this.options.timeout || 10000);
      });
    });
  }
  
  disconnect(): void {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

// Singleton instance for connection reuse (optional)
let sharedClient: RuckusSSHClient | null = null;

export async function executeSSHCommand(command: string = ''): Promise<string> {
  const client = new RuckusSSHClient(undefined, { 
    debug: process.env.SSH_DEBUG === 'true' 
  });
  
  try {
    return await client.executeCommand(command);
  } finally {
    client.disconnect();
  }
}