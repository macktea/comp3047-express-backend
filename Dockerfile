FROM node:current-alpine

COPY . /app
WORKDIR /app
EXPOSE 3000

ENTRYPOINT [ "/bin/sh" ]
CMD ["sh", "-c", "cd /app && npm install && PORT=3000 npm start"]
