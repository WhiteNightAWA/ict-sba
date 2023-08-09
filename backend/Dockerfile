FROM node:18-alpine AS builder

RUN mkdir -p /server
WORKDIR /server

COPY package.json  .
COPY yarn.lock .
RUN yarn install

COPY . .

EXPOSE 80
CMD [ "yarn", "run", "start" ]