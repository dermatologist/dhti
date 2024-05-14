FROM openmrs/openmrs-reference-application-3-frontend:3.0.0-beta.17
COPY . /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html/openmrs-esm-genai-1.0.0

# FROM node:12.18.2 as build

# ARG REACT_APP_SERVICES_HOST=/services/m

# WORKDIR /app

# COPY ./package.json /app/package.json
# COPY ./package-lock.json /app/package-lock.json

# RUN yarn install
# COPY . .
# RUN yarn build


# FROM nginx
# COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=build /app/build /usr/share/nginx/html