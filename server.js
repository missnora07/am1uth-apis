const express = require('express');
const app = express();
const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/ringtones', async (req, res) => {
  const { query } = req.query;
  if (query) {
const url = `https://www.prokerala.com/downloads/ringtones/${query}/`;
axios(url)
  .then(response => {
    if (response.status === 200) {
      const html = response.data;
      const ringtoneData = [];
      const $ = cheerio.load(html);
      const ringtoneElements = $('.list-item-body');
      const promises = [];
      ringtoneElements.each((index, element) => {
        const title = $(element).find('.list-item-entry a').text().trim();
        const downloadLink = $(element).find('.list-item-entry a').attr('href');
        const duration = $(element).find('.d-block.list-item-entry').text().trim();
        if (downloadLink) {
          const fullDownloadLink = "https://www.prokerala.com" + downloadLink;
          const promise = axios(fullDownloadLink)
            .then(response => {
              const htmlCode = response.data;
              const $ = cheerio.load(htmlCode);
              const sourceTag = $('source');
              const srcUrl = sourceTag.attr('src');
              if (srcUrl) {
                ringtoneData.push({ title, srcUrl, duration });
              } else {
                throw new Error('Invalid download link: ' + fullDownloadLink);
              }
            })
            .catch(error => {
              res.send('Error: ' + error);
            });
          promises.push(promise);
        }
      });
      Promise.all(promises)
        .then(() => {
          res.send(ringtoneData); // Send the data using res.send
        })
  .catch(error => {
    res.send('An error occurred: ' + error);
  });
    } else {
      res.send('Request failed with status code:' + response.status);
    }
  })
  .catch(error => {
    res.send('An error occurred: ' + error);
  })
  } else {
    res.status(400).send('Query parameter "query" is required.');
  }
});
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});