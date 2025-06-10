docker compose up -d \
  --build \
  --env-file ./.env \
  --file ./docker-compose.yml \
  --project-name livestream-app