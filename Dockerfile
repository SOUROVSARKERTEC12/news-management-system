FROM node:22 AS development

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:22 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn install --prod

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main"]
