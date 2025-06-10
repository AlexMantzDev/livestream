#!/usr/bin/env bash

set -e

echo "=== Livestreaming App Setup ==="

# Prompt for environment variables with defaults
read -p "Port for the app [3000]: " port
port="${port:-3000}"

read -p "Interface to bind to [0.0.0.0]: " interface
interface="${interface:-0.0.0.0}"

echo "--- MongoDB Setup ---"
read -p "MongoDB host [127.0.0.1]: " mongoHost
mongoHost="${mongoHost:-127.0.0.1}"

read -p "MongoDB port [27017]: " mongoPort
mongoPort="${mongoPort:-27017}"

read -p "MongoDB username [mongo]: " mongoUser
mongoUser="${mongoUser:-mongo}"

# Prompt user until a non-empty value is provided for MongoDB password
while [ -z "$mongoPass" ]; do
  read -s -p "MongoDB password (required): " mongoPass
  echo ""
done

read -p "MongoDB database [livestream]: " mongoDB
mongoDB="${mongoDB:-livestream}"

read -p "MongoDB auth database [admin]: " mongoAuthDB
mongoAuthDB="${mongoAuthDB:-admin}"

echo "--- Redis Setup ---"
read -p "Redis host [127.0.0.1]: " redisHost
redisHost="${redisHost:-127.0.0.1}"

read -p "Redis port [6379]: " redisPort
redisPort="${redisPort:-6379}"

read -p "Redis username [default]: " redisUser
redisUser="${redisUser:-default}"

# Prompt user until a non-empty value is provided for Redis password
while [ -z "$redisPass" ]; do
  read -s -p "Redis password (required): " redisPass
  echo ""
done

# Generate JWT secret
jwtSecret=$(openssl rand -hex 32)

read -p "JWT expiration [24h]: " jwtExpiration
jwtExpiration="${jwtExpiration:-24h}"

# Ensure server directory exists
if [ ! -d "./server" ]; then
  mkdir -p "./server"
fi

# Write .env file
envFile="./server/.env"
cat > "$envFile" <<EOF
PORT=$port
INTERFACE=$interface
MONGO_URI=mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}?authSource=${mongoAuthDB}
REDIS_URL=redis://${redisUser}:${redisPass}@${redisHost}:${redisPort}
JWT_SECRET=$jwtSecret
JWT_EXPIRATION=$jwtExpiration
EOF

echo ""
echo "✅ .env file created!"
echo "Setup complete! 🚀"
