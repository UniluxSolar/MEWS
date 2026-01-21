# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code from backend directory
COPY backend/ .

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]
