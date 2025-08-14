# Ruckus AP SSH MCP

Model Context Protocol (MCP) server for connecting to Ruckus Access Points via SSH to retrieve status and configuration information.

## Features

- **getSerialNumber**: Extract AP serial number and model from SSH banner
- **getACXStatus**: Get ACX management status and connection details
- Uses Docker container for SSH compatibility across different firmware versions
- Interactive authentication handling for Ruckus AP CLI

## Prerequisites

- Docker installed and running
- Access to `dogkeeper886/ssh-sshrsa` Docker image
- Ruckus AP with SSH access enabled

## Installation

### Local Development

```bash
# Clone and setup
npm install
npm run build

# Set environment variables
export AP_IP="192.168.6.162"
export AP_USERNAME="admin"
export AP_PASSWORD="mU!62%*P0WGli6%q"

# Run MCP server
npm start
```

### Docker Usage

```bash
# Build image
docker build -t ruckus-ap-ssh-mcp .

# Run with environment variables
docker run --rm -i \
  -e AP_IP=192.168.6.162 \
  -e AP_USERNAME=admin \
  -e AP_PASSWORD=mU!62%*P0WGli6%q \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ruckus-ap-ssh-mcp
```

## Claude Code Integration

Add to Claude Code as an MCP server:

```bash
claude mcp add ruckus-ap-ssh -- docker run --rm -i \
  -e AP_IP=192.168.6.162 \
  -e AP_USERNAME=admin \
  -e AP_PASSWORD=mU!62%*P0WGli6%q \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ruckus-ap-ssh-mcp
```

## Environment Variables

- `AP_IP`: IP address of the Ruckus AP (required)
- `AP_USERNAME`: SSH username (default: "admin")
- `AP_PASSWORD`: SSH password (required)

## MCP Tools

### getSerialNumber

Returns AP serial number and model information:

```json
{
  "serial": "952443000155",
  "model": "T670 Multimedia Hotzone Wireless"
}
```

### getACXStatus

Returns ACX management status:

```json
{
  "serviceEnabled": true,
  "managedByACX": true,
  "state": "RUN",
  "connectionStatus": "AP is approved by controller",
  "serverList": "device.dev.ruckus.cloud",
  "configUpdateState": "CONF_UPD_FAIL",
  "heartbeatInterval": 30,
  "certValidation": "success"
}
```

## Architecture

- **TypeScript/Node.js** with MCP SDK
- **Docker-based SSH** for firmware compatibility  
- **Interactive authentication** handling
- **JSON structured output** from CLI parsing

## Development

```bash
# Development mode
npm run dev

# Build TypeScript
npm run build

# Test with example AP
node test-mcp.js
```

## License

ISC