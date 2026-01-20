FROM node:18-alpine

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Copy root package files
COPY package*.json ./

# Install root dependencies
RUN npm install

# Setup Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Setup Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy Source Code
COPY backend ./backend
COPY frontend ./frontend

# Build Frontend
RUN cd frontend && npm run build

# Expose Port
ENV PORT=8080
EXPOSE 8080

# Start Application
CMD ["node", "backend/server.js"]
