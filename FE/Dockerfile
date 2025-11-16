# Step 1: Install dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Step 2: Build the application
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

RUN npm run build

# Step 3: Serve using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/.env ./

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]