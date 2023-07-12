const express = require('express');
const app = express();
const ytdl = require('ytdl-core');
const cors = require('cors');

app.use(cors());
app.get('/youtube', async (req, res) => {
  const videoUrl = req.query.url;

  if (!ytdl.validateURL(videoUrl)) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const { title, thumbnails } = info.videoDetails;
    const thumbnail = thumbnails[0]?.url || '';
    const formats = info.formats.map((format) => ({
      itag: format.itag,
      quality: format.qualityLabel || format.quality,
      mimeType: format.mimeType,
      url: format.url,
    }));
    res.json({ title,thumbnail,formats });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
