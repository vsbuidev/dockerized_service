# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /node-app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
