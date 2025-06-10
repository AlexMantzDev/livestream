docker compose --env-file .env \
  --file ./docker-compose.yml \
  --project-name livestream-app \
   up -d --build