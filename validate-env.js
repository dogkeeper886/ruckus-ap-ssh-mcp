#!/usr/bin/env node

// Validate .env file configuration
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Validating .env configuration...\n');

const required = ['AP_IP', 'AP_USERNAME', 'AP_PASSWORD'];
let hasErrors = false;

// Check required variables
for (const key of required) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ ${key} is not set`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key} is set (length: ${value.length})`);
    
    // Special check for password
    if (key === 'AP_PASSWORD') {
      // Check for common truncation issues
      if (value.length < 8) {
        console.warn(`   ⚠️  Password seems short (${value.length} chars). Check if it's truncated by # character.`);
        console.warn(`   💡 If password contains #, !, $, or ", use quotes in .env file`);
      }
      
      // Don't log the actual password, just first 2 chars
      console.log(`   Preview: ${value.substring(0, 2)}***`);
    }
  }
}

// Check optional variables
if (process.env.SSH_DEBUG === 'true') {
  console.log('✅ SSH_DEBUG is enabled');
}

// IP validation
if (process.env.AP_IP) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(process.env.AP_IP)) {
    console.error(`❌ AP_IP doesn't look like a valid IP: ${process.env.AP_IP}`);
    hasErrors = true;
  }
}

console.log('\n' + (hasErrors ? '❌ Validation failed' : '✅ All checks passed'));
process.exit(hasErrors ? 1 : 0);