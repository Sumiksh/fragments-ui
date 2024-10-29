# Build the fragment-ui web app and serve it via parcel 

FROM node:20-bullseye

LABEL maintainer="Sumiksh Trehan <strehan7@myseneca.ca>" \
    description="Fragments node.js  frontend microservice"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# 0. Copy package.json and package-lock.json to /app
COPY package* .

#1. use package lock to install dependencies and versions are pinned. In docker file we have to run the command npm ci
# RUM npm ci
RUN  npm cache clean --force && npm ci 

#1.5 Copy all src files
COPY . .

#2. npm run build
RUN npm run build

#3. Serve dist folder on port 1234. CMD is the default command that will be run when the container starts
CMD npm run serve

EXPOSE 1234

