FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built JavaScript files
COPY dist/ ./dist/

# .env file will be provided at runtime via MCP command

# Set environment variables with defaults
ENV AP_IP=""
ENV AP_USERNAME="super"
ENV AP_PASSWORD=""

# Ensure the script is executable
RUN chmod +x dist/index.js

# Run MCP server
CMD ["node", "dist/index.js"]