FROM node:12.18.2 as build

ARG REACT_APP_SERVICES_HOST=/services/m

WORKDIR /app

COPY ./conch/package.json /app/package.json
COPY ./conch/package-lock.json /app/package-lock.json

RUN yarn install
COPY ./conch .
RUN yarn build


FROM openmrs/openmrs-reference-application-3-frontend:3.0.0-beta.17 as server
COPY ./def /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html/conch-version
COPY --from=build /app/build /usr/share/nginx/html/conch-version