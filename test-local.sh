#!/bin/bash
export AP_IP=192.168.6.162
export AP_USERNAME=admin
export AP_PASSWORD='JL#E7%hD47okz{!7'

echo '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "getSerialNumber", "arguments": {}}, "id": 2}' | node dist/index.js