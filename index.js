const axios = require('axios');
const { parse } = require('node-html-parser');

exports.handler = async (event, context) => {
  const { url } = event.queryStringParameters;

  try {
    const result = await getPostLink(url);
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred' }),
    };
  }
};

async function getPostLink(url) {
  try {
    url = url + "/embed/";
    const response = await axios.get(url);
    const root = parse(response.data);

    let link = '';
    let caption = '';

    if (root.querySelector('.SingleInnerMediaContainerVideo.SingleInnerMediaContainer')) {
      link = getVideoLinkFromHtml(response.data);
    } else if (root.querySelector('.SingleInnerMediaContainer')) {
      const divEl = root.querySelector('.SingleInnerMediaContainer');
      if (divEl) {
        const imgEl = divEl.querySelector('img');
        link = imgEl.getAttribute("src");
      }
    } else if (root.querySelector('.MediaScrollImageContainer')) {
      const links = [];
      const divEls = root.querySelectorAll('.MediaScrollImageContainer');

      divEls.forEach(function(divEl) {
        const imgEl = divEl.querySelector('img');
        let lin = imgEl.getAttribute("src");
        lin = lin.replace("&amp;", "&");
        links.push(lin);
      });

      const urls = links;
      link = urls;
    } else {
      return { error: 'Given url is not a media url' };
    }

    while (link.search("&amp;") !== -1) {
      link = link.replace("&amp;", "&");
    }
    link = link || urls;
    caption = await getCaptionFromHtml(response.data) || 'No caption';

    return { link, caption };
  } catch (error) {
    throw new Error('Failed to fetch post link');
  }
}

async function getCaptionFromHtml(html) {
  const root = parse(html);

  let caption = root.querySelector('.BodyTextContainer')?.text;
  if (!caption)
    caption = 'No caption';
  return caption;
}

function getVideoLinkFromHtml(html) {
  const code = parse(html);
  const vidEl = code.querySelector('.SingleInnerMediaContainerVideo.SingleInnerMediaContainer');
  const videoUrl = vidEl.querySelector('source');
  const videoLink = videoUrl.getAttribute("src");
  return videoLink;
}
