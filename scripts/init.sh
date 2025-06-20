#!/usr/bin/env bash

set -e

echo "=== Livestreaming App Setup ==="

# Prompt for environment variables with defaults
read -p "Port for the app [3000]: " port
port="${port:-3000}"

# Prompt for interface to bind to
read -p "Interface to bind to [0.0.0.0]: " interface
interface="${interface:-0.0.0.0}"

# MongoDB and Redis setup
echo "--- MongoDB Setup ---"
read -p "MongoDB host [127.0.0.1]: " mongoHost
mongoHost="${mongoHost:-127.0.0.1}"

# Prompt for MongoDB port
read -p "MongoDB port [27017]: " mongoPort
mongoPort="${mongoPort:-27017}"

# Prompt user until MongoDB username is provided
while [ -z "$mongoUser" ]; do
  read -p "MongoDB username (required): " mongoUser
done

# Prompt user until MongoDB password is provided
while [ -z "$mongoPass" ]; do
  read -s -p "MongoDB password (required): " mongoPass
  echo ""
done

monogoAuth="${mongoUser}:${mongoPass}@"

# Prompt for MongoDB database and auth database
read -p "MongoDB database [livestream]: " mongoDB
mongoDB="${mongoDB:-livestream}"

# Prompt for MongoDB auth database
read -p "MongoDB auth database [admin]: " mongoAuthDB
mongoAuthDB="${mongoAuthDB:-admin}"

# Redis setup
echo "--- Redis Setup ---"
read -p "Redis host [127.0.0.1]: " redisHost
redisHost="${redisHost:-127.0.0.1}"

# Prompt for Redis port
read -p "Redis port [6379]: " redisPort
redisPort="${redisPort:-6379}"

# Prompt for Redis username and password
read -p "Redis username [default]: " redisUser
redisUser="${redisUser:-default}"

# Prompt user until Redis password is provided
while [ -z "$redisPass" ]; do
  read -s -p "Redis password (required): " redisPass
  echo ""
done

# Determine Redis auth section
if [ -n "$redisUser" ] && [ -n "$redisPass" ]; then
  redisAuth="${redisUser}:${redisPass}@"
else
  redisAuth=""
fi

# Generate JWT secret
jwtSecret=$(openssl rand -hex 32)

# Prompt for JWT expiration
read -p "JWT expiration [24h]: " jwtExpiration
jwtExpiration="${jwtExpiration:-24h}"

# Ensure server directory exists
if [ ! -d "./server" ]; then
  mkdir -p "./server"
fi


# Create root .env file for Docker Compose
rootEnvFile="./.env"
cat > "$rootEnvFile" <<EOF
MONGO_INITDB_ROOT_USERNAME=$mongoUser
MONGO_INITDB_ROOT_PASSWORD=$mongoPass
REDIS_PASSWORD=$redisPass
EOF

# Write .env file for the server
serverEnvFile="./server/.env"
cat > "$serverEnvFile" <<EOF
PORT=$port
INTERFACE=$interface
MONGO_URI=mongodb://${monogoAuth}${mongoHost}:${mongoPort}/${mongoDB}?authSource=${mongoAuthDB}
REDIS_URL=redis://${redisAuth}${redisHost}:${redisPort}
JWT_SECRET=$jwtSecret
JWT_EXPIRATION=$jwtExpiration
EOF

# Run npm install in root
echo ""
echo "📦 Running npm install in root directory..."
npm install

# Run npm install in server
echo ""
echo "📦 Running npm install in ./server..."
npm --prefix ./server install

# Run npm install in client
echo ""
echo "📦 Running npm install in ./client..."
npm --prefix ./client install

echo ""
echo "✅ .env file created!"
echo "Setup complete! 🚀"
