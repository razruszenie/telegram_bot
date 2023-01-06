#!/bin/bash
rm -rf telegram_bot/
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
rm -rf server middleware
rm Dockerfile docker-compose.yml package-lock.json package.json