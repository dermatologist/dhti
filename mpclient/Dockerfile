FROM node:20-alpine

WORKDIR /app

# Install only what we need
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY app.js ./

ENV PORT=8111 \
    MPCLIENT_BASE_URL=http://localhost:8111

EXPOSE 8111

CMD ["npm", "start"]
