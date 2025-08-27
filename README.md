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

### getClientAdmissionControl

Returns client admission control configuration for both WiFi interfaces:

```json
{
  "wifi0": {
    "enabled": false,
    "radioLoadThreshold": 75,
    "clientCountThreshold": 10,
    "clientThroughputThreshold": 0.0
  },
  "wifi1": {
    "enabled": false,
    "radioLoadThreshold": 75,
    "clientCountThreshold": 20,
    "clientThroughputThreshold": 0.0
  }
}
```

### getWiFiChannelInfo

Returns WiFi channel and frequency information for all available interfaces with frequency-based band detection:

```json
{
  "wifi0": {
    "radioEnabled": true,
    "channel": 4,
    "status": "OK",
    "band": "2.4GHz"
  },
  "wifi1": {
    "radioEnabled": true,
    "channel": 52,
    "status": "OK", 
    "band": "5GHz"
  },
  "wifi2": {
    "radioEnabled": true,
    "channel": 116,
    "status": "OK",
    "band": "5GHz"
  }
}
```

**Features:**
- **Frequency-based band detection**: Uses MHz frequency from rkscli output to accurately distinguish 5GHz vs 6GHz
- **Frequency ranges**: 2400-2500MHz=2.4GHz, 5000-5900MHz=5GHz, 5925-7125MHz=6GHz
- **Backwards compatible**: Works with APs that don't have wifi2 interface
- **Fallback logic**: Falls back to interface-based detection if frequency parsing fails

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

## Docker Usage

Docker provides an isolated environment for running the MCP server without local Node.js installation.

### Build Docker Image

```bash
# Build the Docker image
docker build -t ruckus-ap-ssh-mcp .
```

### Environment Setup for Docker

Create your `.env` file with proper password escaping:

```bash
# Ruckus AP SSH Configuration
AP_IP=192.168.6.162
AP_USERNAME=admin

# CRITICAL: Password escaping for special characters
# If your password contains: # ! $ ` \ " or spaces
# You MUST use quotes in .env files:
AP_PASSWORD="password#with!special$chars"
# or
AP_PASSWORD='password#with!special$chars'

# Optional: Enable SSH debug logging
# SSH_DEBUG=true
```

### Integration with Claude Code

Add the Docker-based MCP server to Claude Code:

```bash
# Method 1: Full docker command with env-file (recommended)
# Navigate to your project directory containing .env
cd /path/to/ruckus-ap-ssh-mcp

# Add using full docker command with env-file
claude mcp add ruckus-ap-ssh -- docker run --rm -i --env-file .env ruckus-ap-ssh-mcp

# Method 2: Direct environment variables (less secure)
claude mcp add ruckus-ap-ssh -- docker run --rm -i \
  -e AP_IP=192.168.6.162 \
  -e AP_USERNAME=admin \
  -e AP_PASSWORD="your_password_here" \
  ruckus-ap-ssh-mcp
```

**Recommended**: Use Method 1 with `--env-file .env` for the simplest setup - it automatically uses your local `.env` file and handles the Docker execution.

### Integration with Cursor

For Cursor IDE, add the MCP server configuration to your `settings.json`:

```json
{
  "mcp.servers": {
    "ruckus-ap-ssh": {
      "command": "docker",
      "args": [
        "run", 
        "--rm", 
        "-i", 
        "--env-file", 
        "/absolute/path/to/.env",
        "ruckus-ap-ssh-mcp"
      ],
      "env": {}
    }
  }
}
```

**Important for Cursor**: Use absolute paths for the `.env` file location.

### Password Security Best Practices

🔒 **Password Handling in Docker:**

1. **Use .env files** (recommended):
   ```bash
   # In .env file - quotes handle special characters
   AP_PASSWORD="myP@ssw0rd#123"
   
   # Run with env-file
   docker run --rm -i --env-file .env ruckus-ap-ssh-mcp
   ```

2. **Avoid direct CLI passwords** (visible in process list):
   ```bash
   # ❌ Bad - password visible in ps/history
   docker run -e AP_PASSWORD=secret123 ruckus-ap-ssh-mcp
   
   # ✅ Good - use env-file instead
   docker run --env-file .env ruckus-ap-ssh-mcp
   ```

3. **Special characters require quotes in .env**:
   ```bash
   # ❌ Will fail - # starts comment
   AP_PASSWORD=pass#word
   
   # ✅ Works - quotes preserve special chars
   AP_PASSWORD="pass#word"
   AP_PASSWORD='pass#word'
   ```

### Testing Docker Integration

Test the Docker setup:

```bash
# Test connection
docker run --rm --env-file .env ruckus-ap-ssh-mcp

# Test with Claude Code
# After adding to Claude Code, run:
claude mcp test ruckus-ap-ssh
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