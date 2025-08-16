# Ruckus AP SSH MCP

Model Context Protocol (MCP) server for connecting to Ruckus Access Points via SSH to retrieve status and configuration information.

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Ruckus AP with SSH access enabled
- Valid SSH credentials for the AP

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ruckus-ap-ssh-mcp.git
cd ruckus-ap-ssh-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Create .env file with your AP credentials
cat > .env << EOF
AP_IP=192.168.6.162
AP_USERNAME=admin
AP_PASSWORD=your_password_here
EOF
```

### Add to Claude Code

```bash
# Navigate to the project directory first
cd /path/to/ruckus-ap-ssh-mcp

# Add to Claude Code (automatically uses .env file in current directory)
claude mcp add ruckus-ap-ssh -- node dist/index.js
```

## Available Tools

### getSerialNumber

Returns AP serial number and model information:

```json
{
  "serial": "YOUR_SERIAL_NUMBER",
  "model": "T670 Multimedia Hotzone Wireless"
}
```

### getACXStatus

Returns ACX cloud management status:

```json
{
  "serviceEnabled": true,
  "managedByACX": true,
  "state": "RUN",
  "connectionStatus": "AP is approved by controller",
  "serverList": "device.dev.ruckus.cloud",
  "configUpdateState": "CONF_UPD_COMPLETE",
  "heartbeatInterval": 30,
  "certValidation": "success"
}
```

### getExternalAntennaInfo

Returns external antenna configuration for both WiFi interfaces:

```json
{
  "wifi0": {
    "mode": "Active",
    "gain": "5 dBi"
  },
  "wifi1": {
    "mode": "Active",
    "gain": "5 dBi"
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Required: Ruckus AP SSH Configuration
AP_IP=192.168.6.162
AP_USERNAME=admin
AP_PASSWORD=your_password_here

# Optional: Enable SSH debug logging
# SSH_DEBUG=true
```

**Required Variables:**
- `AP_IP`: IP address of the Ruckus AP
- `AP_USERNAME`: SSH username
- `AP_PASSWORD`: SSH password for the AP

**Optional Variables:**
- `SSH_DEBUG`: Set to 'true' to enable verbose debug logging

### Security Note

⚠️ **Never commit credentials to version control!** 

- Use `.env` files for local development (handles special characters properly)
- Use environment variables or secrets management for production
- The `.env` file is already in `.gitignore`

## Docker Usage (Alternative)

```bash
# Build image
docker build -t ruckus-ap-ssh-mcp .

# Run with .env file
docker run --rm -i --env-file .env ruckus-ap-ssh-mcp

# Add to Claude Code with Docker
claude mcp add ruckus-ap-ssh -- docker run --rm -i --env-file /path/to/.env ruckus-ap-ssh-mcp
```

## Supported Ruckus Models

Tested and verified on:
- T350SE Multimedia Hotzone Wireless AP
- Should work with other Ruckus AP models using rkscli

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify credentials in `.env` file
   - Check AP SSH access is enabled
   - Ensure IP address is reachable

2. **Connection Timeout**
   - Check network connectivity to AP
   - Verify AP is responding on SSH port 22
   - Test with: `ssh admin@YOUR_AP_IP`

3. **Command Not Found**
   - Verify AP model supports the rkscli command
   - Check firmware version compatibility

### Debug Mode

Enable debug logging in your `.env` file:

```bash
SSH_DEBUG=true
```

## Development

### Development Setup

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test
```

### Testing Connection

Create a test script to verify connectivity:

```javascript
// test-connection.js
import { executeSSHCommand } from './dist/utils/sshClient.js';

async function test() {
  try {
    console.log('Testing connection...');
    const banner = await executeSSHCommand('');
    console.log('Success! Banner:', banner);
    
    const acxStatus = await executeSSHCommand('get acx');
    console.log('ACX Status:', acxStatus);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

Run with: `node test-connection.js`

### Architecture

- **TypeScript/Node.js** with MCP SDK
- **ssh2 library** for reliable SSH connectivity
- **Interactive authentication** handling for Ruckus CLI
- **JSON structured output** from command parsing
- **Error handling** and connection management

### Authentication Flow

The server handles Ruckus AP's interactive SSH authentication:

1. **Connect** to AP via SSH
2. **Login prompt**: "Please login:" → Send username + Enter
3. **Password prompt**: "password :" → Send password + Enter  
4. **Shell ready**: "rkscli:" → Execute commands

## License

ISC