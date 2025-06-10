# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root-level package.json and package-lock.json (if present)
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy and install client dependencies
COPY client/package*.json ./client/
RUN npm --prefix ./client install

# Copy and build client code
COPY client ./client
RUN npm --prefix ./client run build

# Copy and install server dependencies
COPY server/package*.json ./server/
RUN npm --prefix ./server install

# Copy the rest of the application code (including ./server and ./public)
COPY . .

# Expose necessary ports
EXPOSE 3000 8000 1935

# Start the server
CMD ["npm", "--prefix", "./server", "run", "start"]
