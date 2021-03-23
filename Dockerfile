FROM node:15.12.0-alpine3.10
RUN mkdir -p /home/node/app/src/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app/src
COPY ./rushing.json ../
COPY ./src/package*.json ./
COPY ./src/yarn.lock ./
USER node 
RUN yarn install
COPY --chown=node:node src/ ./
RUN ls -alh /home/node/app/
RUN ls -alh /home/node/app/src
EXPOSE 8080
CMD [ "node", "start.js" ]
