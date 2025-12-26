FROM node:20-alpine

WORKDIR /app

# Install only what we need
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY app.js ./

ENV PORT=8111 \
    MPCLIENT_BASE_URL=http://localhost:8111 \
    MEDPLUM_ISSUER_URL=http://medplum-server:8103 \
    MEDPLUM_FHIR_BASE_URL=http://medplum-server:8103/fhir/R4 \
    MEDPLUM_CLIENT_ID= \
    MEDPLUM_CLIENT_SECRET= \
    MEDPLUM_REDIRECT_URL=http://localhost:8111 \
    SESSION_SECRET=change-me

EXPOSE 8111

CMD ["npm", "start"]
