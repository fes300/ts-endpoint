FROM node:16-slim

WORKDIR /app/website

ADD .yarn/plugins .yarn/plugins
ADD .yarn/releases .yarn/releases

EXPOSE 3000 35729
COPY ./docs /app/docs
COPY ./website /app/website

RUN yarn install

CMD ["yarn", "start"]
