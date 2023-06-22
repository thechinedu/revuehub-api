# syntax=docker/dockerfile:1

FROM node:18-alpine as builder
WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install && yarn cache clean

COPY . .

RUN yarn build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile
COPY --from=builder /app/dist ./
CMD ["node" "./src/main.js"]
