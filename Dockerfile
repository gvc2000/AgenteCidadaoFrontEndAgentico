# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx files to avoid conflicts
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template and startup script
COPY nginx.conf.template /nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
