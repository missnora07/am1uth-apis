const express = require('express');
const axios = require('axios');
const { parse } = require('node-html-parser');

const app = express();
const PORT = 3000;

app.get('/api/threads', async (req, res) => {
  const { url } = req.query;

  try {
    const result = await getPostLink(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred'});
  }
});

async function getPostLink(url) {
  try {
    url = url + "/embed/";
    const response = await axios.get(url);
    const root = parse(response.data);

    let link = '';

    if (root.querySelector('.SingleInnerMediaContainerVideo.SingleInnerMediaContainer')) {
      link = getVideoLinkFromHtml(response.data);
    } else if(root.querySelector('.SingleInnerMediaContainer')) {
      var divEl = root.querySelector('.SingleInnerMediaContainer');
      if (divEl) {
        var imgEl = divEl.querySelector('img');
        link = imgEl.getAttribute("src");
      }
    } else if (root.querySelector('.MediaScrollImageContainer')) {
  var links = [];
  var divEls = root.querySelectorAll('.MediaScrollImageContainer');
  
  divEls.forEach(function(divEl) {
    var imgEl = divEl.querySelector('img');
    var lin = imgEl.getAttribute("src");
    lin = lin.replace("&amp;","&");
    links.push(lin);
  });
      
      var urls = links;
      } else {
      return {error:'Given url is not a media url' }
    }

    while (link.search("&amp;") !== -1) {
      link = link.replace("&amp;", "&");
    }
    link = urls || link;
    const caption = await getCaptionFromHtml(response.data);

    return { link, caption };
  } catch (error) {
    throw new Error('Failed to fetch post link ');
  }
}


async function getCaptionFromHtml(html) {
  const root = parse(html);

  let caption = root.querySelector('.BodyTextContainer')?.text;
  if (caption == undefined)
    caption = 'No caption';
  return caption;
}

function getVideoLinkFromHtml(html) {
  const code = parse(html);
  const vidEl = code.querySelector('.SingleInnerMediaContainerVideo.SingleInnerMediaContainer');
  var videoUrl = vidEl.querySelector('source');
  var videoLink = videoUrl.getAttribute("src");
  return videoLink;
}
app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
})
