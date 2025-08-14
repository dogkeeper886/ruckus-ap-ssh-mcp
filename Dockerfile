FROM node:18-alpine

# Install Docker CLI for SSH container execution
RUN apk add --no-cache docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built JavaScript files
COPY dist/ ./dist/

# Set environment variables with defaults
ENV AP_IP=""
ENV AP_USERNAME="super"
ENV AP_PASSWORD=""

# Ensure the script is executable
RUN chmod +x dist/index.js

# Run MCP server
CMD ["node", "dist/index.js"]