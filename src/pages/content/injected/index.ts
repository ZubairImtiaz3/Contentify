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

const sendPostsToPopup = postData => {
  chrome.runtime.sendMessage({ action: 'scrapedData', data: postData });
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

      // Check if the post text element is found
      if (postTextElement) {
        const postText = postTextElement.textContent.trim().toLowerCase();

        // Check if the post has already been scraped
        if (!scrapedPosts.has(postText)) {
          // Check if the post contains at least 2 matching keywords from the tags
          const matchingKeywords = tags.filter(keyword => postText.includes(keyword.toLowerCase()));
          if (matchingKeywords.length >= 2) {
            // Extract user profile link
            const userProfileLinkElement = postElement.querySelector('.update-components-actor__meta-link');

            // Check if the user profile link element is found
            if (userProfileLinkElement) {
              const userProfileLink = userProfileLinkElement.getAttribute('href');

              // Extract user name
              const userNameElement = userProfileLinkElement.querySelector('.update-components-actor__name');
             const userName = userNameElement
               ? userNameElement.querySelector('[aria-hidden="true"]').textContent.trim()
               : 'Unknown';

              // Send the data to the popup
              sendPostsToPopup({ user: userName, post: postText, profileLink: userProfileLink });

              console.log(`Post ${index + 1} - User: ${userName}, Post: ${postText}, Profile Link: ${userProfileLink}`);
            } else {
              console.error(`User profile link not found for Post ${index + 1}`);
            }

            // Add the post text to the set of scraped posts
            scrapedPosts.add(postText);
          }
        }
      } else {
        console.error(`Post text element not found for Post ${index + 1}`);
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
