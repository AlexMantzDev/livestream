docker run -d \
  -p 3000:3000 \
  -p 8000:8000 \
  -p 1935:1935 \
  --env-file ./server/.env \
  livestream-app
