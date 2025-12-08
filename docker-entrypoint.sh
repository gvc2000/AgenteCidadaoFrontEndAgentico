#!/bin/sh
set -e

# Use PORT from environment or default to 80
PORT=${PORT:-80}

echo "=========================================="
echo "Railway Nginx Startup"
echo "PORT environment variable: $PORT"
echo "=========================================="

# Replace PORT in nginx config template
echo "Generating nginx configuration from template..."
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Show the generated config for debugging
echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf | head -10

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g 'daemon off;'
