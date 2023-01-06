FROM node:10-alpine
ENV APP_ROOT /web
ENV NPM_CONFIG_PRODUCTION false

WORKDIR ${APP_ROOT}
ADD . ${APP_ROOT}

RUN apk add --no-cache git

COPY package*.json ./
RUN git config --global url."https://".insteadOf git://
RUN npm install
# Copy app source code
COPY . .

ENV NODE_ENV production
ENV TELEGRAM 5652184112:AAEdFhmYZxmdtx8ScJlimBjWGrjbquVG_Dw
ENV JWT oWgJAyE1HBbj26FR2jEG

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait

## THE LIFE SAVER
RUN chmod +x /wait

## Launch the wait tool and then your application
CMD /wait && npm run start
