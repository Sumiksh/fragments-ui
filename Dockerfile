# Build the fragment-ui web app and serve it via parcel 
# Stage 0: For dependencies installation
FROM node:20-bullseye@sha256:fef4f3157671d0b07afd30b9b75a93b04c7269f38758a7f4db2385f26ed36c81 AS dependencies
LABEL maintainer="Sumiksh Trehan <strehan7@myseneca.ca>" \
    description="Fragments node.js frontend microservice"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false \
    ENV=production

WORKDIR /app

# 0. Copy package.json and package-lock.json to /app
COPY package* .

#1. use package lock to install dependencies and versions are pinned. In docker file we have to run the command npm ci
# We have to run it without production because it depends on parcel and couple other dev dependencies
RUN npm ci

############################################
# Stage 1: For building the app
FROM node:20-bullseye@sha256:fef4f3157671d0b07afd30b9b75a93b04c7269f38758a7f4db2385f26ed36c81 AS build 

# Install tini. I can do this with npm ci in multiline or here. Will USE IN init on the command line while running the container
#RUN apt-get update && apt-get install -y tini

WORKDIR /app

#Copy genereated dependencies from the source code
COPY --from=dependencies /app /app

#1.5 Copy all src files
COPY . .

#2. npm run build
RUN npm run build

#3. Serve dist folder on port 1234. CMD is the default command that will be run when the container starts
# ENTRYPOINT ["/usr/bin/tini", "--"]
# CMD ["npm","run","serve"]
# EXPOSE 1234

############################################
# Stage 2: For serving the app
FROM nginx:1.26.2-alpine@sha256:7a0c64ed6164fe4b8cc0a2707ed29010ef3f2252f23f3206e3a2d539407d264d

#Copy the files from the build stage. Copy files from app/dist to /usr/share/nginx/html to serve the static content 
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl --fail localhost || exit 1
