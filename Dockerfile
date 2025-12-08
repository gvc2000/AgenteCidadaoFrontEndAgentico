# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install gettext for envsubst (needed for PORT substitution)
RUN apk add --no-cache gettext

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix permissions for nginx to read files
RUN chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Copy nginx configuration template and entrypoint script
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh && \
    echo "Build timestamp: $(date)" > /build-info.txt

# Expose port - Railway will override with PORT env var
EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
