# Server Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript to dist/
RUN npm run build

EXPOSE 4000

# Start command (Runs migrations then servers)
CMD ["npm", "start"]
