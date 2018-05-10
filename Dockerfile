FROM node:9.8-alpine
MAINTAINER Thanh NGUYEN <u.nguyenthanh@gmail.com>

RUN mkdir -p /vui
COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

ENV HOST 0.0.0.0
EXPOSE 3000
CMD ["sh", "-c", "npm start"]

