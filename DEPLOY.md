# PassiveOS deploy

One Docker image runs UI + API + storage.

## Render Blueprint
Connect this repo as a Blueprint on render.com

## Railway
Deploy from GitHub — uses Dockerfile + railway.toml

## Docker
```bash
docker build -t passiveos .
docker run -p 8080:80 passiveos
```
