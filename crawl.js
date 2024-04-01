const { url } = require("inspector");
const { JSDOM } = require("jsdom");

async function crawlPage(baseUrl, currentURL, pages) {
  const baseURLObj = new URL(baseUrl);
  const currentURLObj = new URL(currentURL);
  if (baseURLObj.hostname !== currentURLObj.hostname) {
    return pages;
  }
  const normalizedCurrentURL = normalizeURL(currentURL);
  if (pages[normalizedCurrentURL] > 0) {
    pages[normalizedCurrentURL] += 1;
    return pages;
  }

  pages[normalizedCurrentURL] = 1;

  console.log(`actively crawling: ${currentURL}`);

  try {
    const resp = await fetch(currentURL);
    if (resp.status > 399) {
      console.log(
        `error in fetch with status code: ${resp.status} on page: ${currentURL}`
      );
      return pages;
    }

    const contentType = resp.headers.get("content-type");
    if (!contentType.includes("text/html")) {
      console.log(
        `non  html response, content type: ${contentType} on page: ${currentURL}`
      );
      return pages;
    }

    const htmlBody = await resp.text();

    const nextURLs = getURLsFromHTML(htmlBody, currentURL);

    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseUrl, nextURL, pages);
    }
  } catch (err) {
    console.log(`error in fetch ${err.message} on page ${currentURL}`);
  }

  return pages;
}

function getURLsFromHTML(htmlBody, baseUrl) {
  const urls = [];
  const dom = new JSDOM(htmlBody);
  const linkElements = dom.window.document.querySelectorAll("a");
  for (const linkElement of linkElements) {
    dom.window.document.body.appendChild(linkElement);
    const href = linkElement.href;
    if (href.slice(0, 1) === "/") {
      //relative
      try {
        const urlObj = new URL(`${baseUrl}${href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with relative url: ${err.message}`);
      }
    } else {
      //absolute
      try {
        const urlObj = new URL(`${href}`);
        urls.push(urlObj.href);
      } catch (err) {
        console.log(`error with absolute url: ${err.message}`);
      }
    }
  }
  return urls;
}

function normalizeURL(urlString) {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  if (hostPath.length > 0 && hostPath.slice(-1) === "/") {
    return hostPath.slice(0, -1);
  }

  return hostPath;
}
module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
