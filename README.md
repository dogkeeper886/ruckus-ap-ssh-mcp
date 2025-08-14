# Ruckus AP SSH MCP

Model Context Protocol (MCP) server for connecting to Ruckus Access Points via SSH to retrieve status and configuration information.

## Features

- **getSerialNumber**: Extract AP serial number and model from SSH banner
- **getACXStatus**: Get ACX management status and connection details
- Uses ssh2 library for reliable SSH connectivity
- Interactive authentication handling for Ruckus AP CLI

## Prerequisites

- Node.js 18+ installed
- Docker installed and running (optional, for containerized deployment)
- Ruckus AP with SSH access enabled
- Valid SSH credentials for the AP

## Installation

### Local Development

```bash
# Clone and setup
npm install
npm run build

# Create .env file with your AP credentials
cp .env.example .env
# Edit .env with your actual credentials

# Run MCP server
npm start
```

### Docker Usage

```bash
# Build image
docker build -t ruckus-ap-ssh-mcp .

# Run with environment variables
docker run --rm -i \
  -e AP_IP=YOUR_AP_IP \
  -e AP_USERNAME=YOUR_USERNAME \
  -e AP_PASSWORD=YOUR_PASSWORD \
  ruckus-ap-ssh-mcp
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Ruckus AP SSH Configuration
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

- Use `.env` files for local development (prevents special character issues)
- Use environment variables or secrets management for production
- Add `.env` to your `.gitignore` file

## Claude Code Integration

Add to Claude Code as an MCP server:

### Recommended: Using .env file (handles all special characters)

```bash
# Using .env file automatically handles passwords with special characters
claude mcp add ruckus-ap-ssh -- node dist/index.js
```

### Alternative: Docker with .env file

```bash
# Method 1: Using .env file (safest for all passwords)
claude mcp add ruckus-ap-ssh -- docker run --rm -i \
  --env-file /path/to/your/.env \
  ruckus-ap-ssh-mcp

# Method 2: Direct environment variables
claude mcp add ruckus-ap-ssh -- docker run --rm -i \
  -e AP_IP=YOUR_AP_IP \
  -e AP_USERNAME=YOUR_USERNAME \
  -e AP_PASSWORD=YOUR_PASSWORD \
  ruckus-ap-ssh-mcp
```

## MCP Tools

### getSerialNumber

Returns AP serial number and model information extracted from the login banner:

```json
{
  "serial": "YOUR_SERIAL_NUMBER",
  "model": "T670 Multimedia Hotzone Wireless"
}
```

### getACXStatus

Returns comprehensive ACX cloud management status:

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

## Authentication Flow

The server handles Ruckus AP's interactive SSH authentication:

1. **Connect** to AP via SSH
2. **Login prompt**: "Please login:" → Send username + Enter
3. **Password prompt**: "password :" → Send password + Enter  
4. **Shell ready**: "rkscli:" → Execute commands

## Architecture

- **TypeScript/Node.js** with MCP SDK
- **ssh2 library** for reliable SSH connectivity
- **Interactive authentication** handling for Ruckus CLI
- **JSON structured output** from command parsing
- **Error handling** and connection management

## Development

```bash
# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Test individual functions
node -e "
import('./dist/utils/sshClient.js').then(m => {
  m.executeSSHCommand('get info').then(console.log);
});
"
```

### Testing

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

## Supported Ruckus Models

Tested and verified on:
- T670 Multimedia Hotzone Wireless AP
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
   - Increase timeout in ssh2 connection settings

3. **Command Not Found**
   - Verify AP model supports the rkscli command
   - Check firmware version compatibility

### Debug Mode

Enable debug logging by setting environment variable in your `.env` file:

```bash
SSH_DEBUG=true
```

## License

ISC