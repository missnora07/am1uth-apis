const express = require('express');
const app = express();
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
comst cors = require('cors');

// Endpoint to handle YouTube video download
app.use(cors());
app.get('/download', (req, res) => {
  const { quality, url, videoOrAudio } = req.query; // Parameters passed in JSON format

  // Validate the parameters
  if (!quality || !url || !videoOrAudio) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Download options
  let format = `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`;
  let onlyAudio = false;

  if (videoOrAudio === 'audio') {
    format = 'bestaudio/best';
    onlyAudio = true;
  }

  // Create a unique output filename for the downloaded file
  const outputFilename = `output.${onlyAudio ? 'mp3' : 'mp4'}`;

  // Function to download a video or audio file using youtube-dl
  function downloadFile(url, outputFilename, format, onlyAudio) {
    const command = `youtube-dl -f ${format} -o ${outputFilename} ${url}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred during the download' });
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'An error occurred during the download' });
      }

      console.log(`Downloaded ${outputFilename}`);

      if (onlyAudio) {
        // If only audio is requested, convert the downloaded file to an audio-only format
        const outputPath = `./downloads/${outputFilename.replace(/\.[^/.]+$/, '.mp3')}`;

        ffmpeg(outputFilename)
          .noVideo()
          .audioCodec('libmp3lame')
          .output(outputPath)
          .on('end', () => {
            console.log(`Converted to audio: ${outputPath}`);
            // Delete the original downloaded file after conversion
            fs.unlink(outputFilename, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
              }
            });
            // Send the converted audio file to the client
            res.download(outputPath, outputFilename, () => {
              // Delete the converted audio file after it has been sent to the client
              fs.unlink(outputPath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                }
              });
            });
          })
          .on('error', (err) => {
            console.error('Conversion error:', err);
            return res.status(500).json({ error: 'An error occurred during the conversion' });
          })
          .run();
      } else {
        // Send the downloaded video file to the client
        res.download(outputFilename, outputFilename, () => {
          // Delete the downloaded video file after it has been sent to the client
          fs.unlink(outputFilename, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            }
          });
        });
      }
    });
  }

  // Call the downloadFile function with the provided options
  downloadFile(url, outputFilename, format, onlyAudio);
});

// Start the server
const port = 3000; // Choose a port for your server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
