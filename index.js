const express = require('express');
const youtubedl = require('youtube-dl');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.get('/download', (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    res.status(400).json({ error: 'No video URL provided' });
    return;
  }

  const options = [
    '--format=best',
    '--no-playlist',
    videoUrl,
  ];

  youtubedl.getInfo(videoUrl, options, (err, info) => {
    if (err) {
      res.status(500).json({ error: 'Failed to fetch video information' });
      return;
    }

    const { title, thumbnail, formats } = info;

    const videoFiles = formats
      .filter((format) => format.format_note !== 'DASH audio' && format.acodec !== 'none')
      .map((format) => ({
        format: format.format_note,
        url: format.url,
      }));

    res.json({
      title,
      thumbnail,
      files: videoFiles,
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
