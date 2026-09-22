# PassiveOS — single container: React UI + FastAPI + file DB
FROM node:20-alpine AS frontend-build
WORKDIR /fe
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend/ ./
ENV VITE_API_URL=
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/nginx/sites-enabled/default

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY --from=frontend-build /fe/dist /usr/share/nginx/html

RUN printf '%s\n' \
  'server {' \
  '  listen 80 default_server;' \
  '  root /usr/share/nginx/html;' \
  '  index index.html;' \
  '  location / {' \
  '    try_files $uri $uri/ /index.html;' \
  '  }' \
  '  location /api/ {' \
  '    proxy_pass http://127.0.0.1:8000;' \
  '    proxy_http_version 1.1;' \
  '    proxy_set_header Host $host;' \
  '    proxy_set_header X-Real-IP $remote_addr;' \
  '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' \
  '    proxy_set_header X-Forwarded-Proto $scheme;' \
  '  }' \
  '}' > /etc/nginx/conf.d/default.conf

ENV USE_FILE_DB=1
ENV PYTHONUNBUFFERED=1
ENV CORS_ORIGINS=*

EXPOSE 80

COPY start-container.sh /start-container.sh
RUN chmod +x /start-container.sh
CMD ["/start-container.sh"]
