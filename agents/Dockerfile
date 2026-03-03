# Use Node.js as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install tsx globally or use npx
RUN npm install -g tsx

# Environment variables will be provided by Railway
# But we ensure we're in the right mode
ENV NODE_ENV=production

# Command to run the autonomous swarm orchestrator
CMD ["npm", "run", "swarm"]
