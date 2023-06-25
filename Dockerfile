FROM node:14
RUN git clone https://github.com/missnora07/ringtone-downloader /railway/Nora07
WORKDIR /railway/Nora07
EXPOSE 3000
CMD ["node", "server.js"]