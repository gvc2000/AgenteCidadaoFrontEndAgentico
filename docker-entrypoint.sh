#!/bin/sh
set -e

# Use PORT from environment or default to 80
PORT=${PORT:-80}

echo "Starting nginx on port $PORT..."

# Replace PORT in nginx config template
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
