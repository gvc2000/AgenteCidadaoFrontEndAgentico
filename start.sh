#!/bin/sh
set -e

PORT=${PORT:-8080}

echo "=== Starting Nginx on port $PORT ==="
echo "Listening on: 0.0.0.0:$PORT"

# Remove default nginx configs to avoid conflicts
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

# Ensure the html directory exists and has correct permissions
# Using 755 for directories and 644 for files
mkdir -p /usr/share/nginx/html
find /usr/share/nginx/html -type d -exec chmod 755 {} \;
find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Change ownership to nginx user
chown -R nginx:nginx /usr/share/nginx/html

echo "=== Checking permissions ==="
ls -la /usr/share/nginx/html/
ls -la /usr/share/nginx/

# Generate nginx config from template
envsubst '${PORT}' < /nginx.conf.template > /etc/nginx/conf.d/app.conf

echo "=== Config generated ==="
cat /etc/nginx/conf.d/app.conf

echo "=== Testing nginx config ==="
nginx -t

echo "=== Starting nginx ==="
exec nginx -g 'daemon off;'
