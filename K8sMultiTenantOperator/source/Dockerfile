FROM node:14.2-alpine
WORKDIR /usr/src/operator
COPY ["package.json", "package-lock.json*", "./"]
RUN mkdir -p logs
RUN npm install --silent && mv node_modules ./
COPY . .
EXPOSE 7070
CMD ["npm", "start"]
