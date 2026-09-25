FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
COPY indexing-service/package*.json ./indexing-service/
RUN npm install

COPY . .
WORKDIR /app/backend
EXPOSE 3001
CMD ["npm", "run", "dev"]
