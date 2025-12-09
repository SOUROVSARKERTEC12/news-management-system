# Build stage
FROM node:latest AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build

# Production stage
FROM node:latest

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=development

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 5000

# Start the application
CMD ["node", "dist/main.js"]
