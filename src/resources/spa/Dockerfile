FROM node:20 as build

ARG REACT_APP_SERVICES_HOST=/services/m

WORKDIR /app

COPY ./conch .

RUN corepack disable && \
    npm install -g yarn@4.2.2 && \
    corepack enable && \
    yarn install && \
    yarn build

FROM server-image as server
COPY ./def /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html/conch-version
COPY --from=build /app/dist /usr/share/nginx/html/conch-version