FROM node:20-alpine
WORKDIR /app
COPY . .
VOLUME /app/storage
EXPOSE 3000
CMD ["node", "server.js"]
