# ==============================================================================
# Multi-stage Dockerfile for React Vite Frontend
# ==============================================================================

# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps || npm install

COPY frontend/ ./
RUN npm run build

# Production Stage
FROM nginx:alpine

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
