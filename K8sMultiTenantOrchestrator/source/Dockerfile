FROM node:14.2-alpine
WORKDIR /usr/src/orchestrator
COPY ["package.json", "package-lock.json*", "./"]
RUN mkdir -p logs
RUN npm install --silent && mv node_modules ./
COPY . .
EXPOSE 7071
CMD ["npm", "start"]
