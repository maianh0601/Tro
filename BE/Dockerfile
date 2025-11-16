# Step 1: Install dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install

# Step 2: Build source code (TypeScript, etc.)
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

# Step 3: Run application
FROM node:18-alpine AS runner
WORKDIR /app

# Chỉ copy những gì cần thiết để chạy app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=dependencies /app/node_modules ./node_modules  
COPY --from=build /app/.env ./                             

EXPOSE 5000
CMD ["npm", "start"]
