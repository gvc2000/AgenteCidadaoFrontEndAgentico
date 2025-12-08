#!/bin/sh
set -e

# Use PORT from environment or default to 80
PORT=${PORT:-80}

echo "=========================================="
echo "Railway Nginx Startup - VERSION 2.0"
echo "Script updated: Dec 8, 2025 - 14:35 UTC"
echo "PORT environment variable: $PORT"
echo "=========================================="

# Verify built files exist
echo "Checking built files..."
if [ -d "/usr/share/nginx/html" ]; then
    echo "HTML directory exists"
    echo "Files in /usr/share/nginx/html:"
    ls -lah /usr/share/nginx/html/
    if [ -f "/usr/share/nginx/html/index.html" ]; then
        echo "✓ index.html found"
        echo "index.html size: $(wc -c < /usr/share/nginx/html/index.html) bytes"
        echo "index.html permissions: $(ls -l /usr/share/nginx/html/index.html)"
        echo "First 200 chars of index.html:"
        head -c 200 /usr/share/nginx/html/index.html
        echo ""
    else
        echo "✗ ERROR: index.html NOT FOUND!"
    fi
else
    echo "✗ ERROR: /usr/share/nginx/html does not exist!"
fi
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

echo "Starting nginx on port $PORT (listening on 0.0.0.0:$PORT)..."
echo "Nginx will accept connections from Railway proxy."
exec nginx -g 'daemon off;'
