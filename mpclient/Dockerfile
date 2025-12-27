FROM node:20-alpine

WORKDIR /app

# Install only what we need
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY app.js ./

ENV PORT=8111 \
    MPCLIENT_BASE_URL=http://localhost:8111 \
    MEDPLUM_TOKEN_URL=http://medplum-server:8103/oauth2/token \
    MEDPLUM_CLIENT_ID=client-id \
    MEDPLUM_CLIENT_SECRET=secret

EXPOSE 8111

CMD ["npm", "start"]
