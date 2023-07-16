FROM node:14
RUN git clone https://github.com/missnora07/am1uth-apis /railway/Nora07
WORKDIR /railway/Nora07
COPY package*.json ./
COPY . .
RUN npm install axios express node-html-parser
EXPOSE 3000
CMD ["node", "index.js"]
