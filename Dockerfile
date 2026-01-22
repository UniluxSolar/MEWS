# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup Backend
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Copy built frontend from Stage 1
# server.js expects ../frontend/dist relative to /app, which maps to /frontend/dist
COPY --from=frontend-builder /app/frontend/dist /frontend/dist

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]
