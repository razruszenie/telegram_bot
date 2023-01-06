FROM node:10-alpine
ENV APP_ROOT /web
ENV NPM_CONFIG_PRODUCTION false

WORKDIR ${APP_ROOT}
ADD . ${APP_ROOT}

RUN apk add --no-cache git
RUN apk add --no-cache imagemagick
RUN apk add --no-cache graphicsmagick

COPY package*.json ./
RUN git config --global url."https://".insteadOf git://
RUN npm install
# Copy app source code
COPY . .

ENV HOST 0.0.0.0
ENV PORT=3000
ENV BASE_URL https://autopoland.ru
ENV NODE_ENV production
ENV JWT NSupzMO32QrccfGIj22ev3Mdk1ALztCKlMhfJOoc9w64THBvfIKamQ6XCF3trBVz
ENV MONGO_URI mongodb://admin:454win8prO@mongo:27017/autopoland?authSource=admin

RUN npm run build --node-flags --max-old-space-size=2048 --no-warnings


## THE LIFE SAVER
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

## Launch the wait tool and then your application
CMD /wait && npm run start
