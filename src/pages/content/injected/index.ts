/**
 * DO NOT USE import someModule from '...';
 *
 * @issue-url https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/160
 *
 * Chrome extensions don't support modules in content scripts.
 * If you want to use other modules in content scripts, you need to import them via these files.
 *
 */

import('@pages/content/injected/toggleTheme');

let isScrolling = true;
const scrapedPosts = new Set();
let crawlInterval;

const smoothScrollToBottom = () => {
  const baseScrollStep = window.innerHeight / 60;
  let scrollCount = 0;

  const scroll = () => {
    if (scrollCount >= document.body.scrollHeight - window.innerHeight || !isScrolling) {
      // Stop scrolling when reaching the bottom
      return;
    }

    const scrollStep = baseScrollStep * (0.8 + Math.random() * 0.4);
    scrollCount += scrollStep;
    window.scrollTo(0, Math.min(scrollCount, document.body.scrollHeight - window.innerHeight));

    requestAnimationFrame(scroll);
  };
  scroll();
};

const scrapePost = tags => {
  // All elements with the post text and user profile link
  const postElements = document.querySelectorAll('.feed-shared-update-v2');

  if (postElements.length > 0) {
    // Loop through each post element
    postElements.forEach((postElement, index) => {
      // Extract post text
      const postTextElement = postElement.querySelector(
        '.feed-shared-update-v2__description .update-components-update-v2__commentary span',
      );
      if (!postTextElement) {
        console.error(`Post text element not found for Post ${index + 1}`);
        return;
      }
      const postText = postTextElement.textContent.trim().toLowerCase();

      // Check if the post has already been scraped
      if (!scrapedPosts.has(postText)) {
        // Check if the post contains at least 2 matching keywords from the tags
        const matchingKeywords = tags.filter(keyword => postText.includes(keyword.toLowerCase()));
        if (matchingKeywords.length >= 2) {
          // Extract user profile link
          const userProfileLinkElement = postElement.querySelector('.update-components-actor__meta-link');

          if (userProfileLinkElement) {
            const userProfileLink = userProfileLinkElement.getAttribute('href');

            // Extract user name
            const userNameElement = userProfileLinkElement.querySelector('.update-components-actor__name');
            const userName = userNameElement ? userNameElement.textContent.trim() : 'Unknown';

            console.log(`Post ${index + 1} - User: ${userName}, Post: ${postText}, Profile Link: ${userProfileLink}`);
          } else {
            console.error(`User profile link not found for Post ${index + 1}`);
          }

          scrapedPosts.add(postText);
        }
      }
    });
  } else {
    console.error('Post elements not found');
  }
};

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === 'startCrawling') {
    const tags = request.tags;
    scrapedPosts.clear();
    smoothScrollToBottom();

    // Start scraping post text every 4 seconds
    crawlInterval = setInterval(() => {
      scrapePost(tags);
    }, 4000);
  } else if (request.action === 'stopCrawling') {
    clearInterval(crawlInterval);
    isScrolling = false;
  }
});
