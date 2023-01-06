#!/bin/bash
rm -rf telegram_bot/
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
rm -rf server middleware
rm Dockerfile docker-compose.yml package-lock.json package.json
git clone https://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@github.com/razruszenie/telegram_bot
mv -v ~/apbot/telegram_bot/* ~/apbot
docker-compose up -d --build