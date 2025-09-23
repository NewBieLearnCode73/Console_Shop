# BUILD STAGE 1
FROM node:20 as builder

WORKDIR  /user/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# BUILD STAGE 2
FROM node:20 as runner

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY --from=builder /user/src/app/dist ./dist

COPY .env ./

COPY typeorm.config.ts ./

COPY tsconfig.json ./

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod-with-migrations"]
