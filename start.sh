#!/bin/sh
set -e

PORT=${PORT:-8080}

echo "=== Starting Nginx on port $PORT ==="
echo "Listening on: 0.0.0.0:$PORT"

# Generate simple nginx config
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 0.0.0.0:$PORT;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "=== Config generated ==="
cat /etc/nginx/conf.d/default.conf

echo "=== Starting nginx ==="
exec nginx -g 'daemon off;'
