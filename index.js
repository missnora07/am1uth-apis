const express = require('express');
const ytdl = require('node-ytdl-core');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    res.status(400).json({ error: 'No video URL provided' });
    return;
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    const hasAudio = formats.some((format) => format.hasAudio);
    const hasVideo = formats.some((format) => format.hasVideo);
    const audioBitrate = formats.find((format) => format.hasAudio)?.audioBitrate || 0;

    const videoInfo = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      files: formats.map((format) => ({
        format: format.qualityLabel,
        url: format.url,
      })),
      hasAudio,
      hasVideo,
      audioBitrate,
    };

    res.json(videoInfo);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch video information' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
