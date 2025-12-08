#!/bin/sh
set -e

PORT=${PORT:-8080}

echo "=== Starting Nginx on port $PORT ==="
echo "Listening on: 0.0.0.0:$PORT"

# Remove default nginx configs to avoid conflicts
rm -f /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

# Ensure the html directory exists and has correct permissions
mkdir -p /usr/share/nginx/html
chmod -R 755 /usr/share/nginx/html

# Generate nginx config from template
envsubst '${PORT}' < /nginx.conf.template > /etc/nginx/conf.d/app.conf

echo "=== Config generated ==="
cat /etc/nginx/conf.d/app.conf

echo "=== Files in html directory ==="
ls -la /usr/share/nginx/html/

echo "=== Starting nginx ==="
exec nginx -g 'daemon off;'
