# https://dev.to/alex_barashkov/using-docker-for-nodejs-in-development-and-production-3cgp

# The instructions for the first stage
FROM node:12-alpine as builder

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk --no-cache add python make g++

COPY ./package*.json ./
RUN npm install --production


# ------------------------------------


# The instructions for second stage
FROM node:12-alpine

WORKDIR /opt/OpenHaus-Server
COPY --from=builder node_modules node_modules
RUN apk --no-cache add openssl

COPY ./dist ./
COPY ./package.json ./

# ENV HTTP_PORT=8080
ENV NODE_ENV=production
# ENV DB_HOST=10.0.0.1

CMD ["node", "index.js"]