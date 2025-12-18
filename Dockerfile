FROM ubuntu:latest
LABEL authors="hoang"

ENTRYPOINT ["top", "-b"]

FROM node:22
WORKDIR /app

COPY package*.json ./
RUN pnpm install

