# Stage 1: Install dependencies and build SSR
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run SSR server only
FROM node:20 AS prod
WORKDIR /app
EXPOSE 4000

# Copy SSR build output
COPY --from=build /app/dist/pet-lovers-angular /app/dist/pet-lovers-angular
COPY --from=build /app/node_modules /app/node_modules

CMD ["node", "dist/pet-lovers-angular/server/server.mjs"]
