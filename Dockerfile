FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends git \
    ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
