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

const sendPostsToPopup = scrapedPosts => {
  const postsArray = Array.from(scrapedPosts).map((jsonString: string) => JSON.parse(jsonString));
  chrome.runtime.sendMessage({ action: 'scrapedData', data: postsArray });
};

const scrapePost = (tags, requiredTags) => {
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
        const userProfileLinkElement = postElement.querySelector('.update-components-actor__meta-link');

        // Check if the user profile link element is found
        if (userProfileLinkElement) {
          const userProfileLink = userProfileLinkElement.getAttribute('href');

          // Extract user name
          const userNameElement = userProfileLinkElement.querySelector('.update-components-actor__name');
          const userName = userNameElement
            ? userNameElement.querySelector('[aria-hidden="true"]').textContent.trim()
            : 'Unknown';

          // Check if all required tags are present and apply logic based on the number of required tags
          const allRequiredTagsFound = requiredTags.every(tag => postText.includes(tag.toLowerCase()));
          const allAdditionalTagsFound = tags.filter(tag => postText.includes(tag.toLowerCase()));

          const numberOfRequiredTagsFound = allRequiredTagsFound ? requiredTags.length : 0;
          const numberOfAdditionalTagsFound = allAdditionalTagsFound.length;

          const totalTagsFound = numberOfRequiredTagsFound + numberOfAdditionalTagsFound;

          if (
            (requiredTags.length > 1 && totalTagsFound >= 2) ||
            (requiredTags.length === 1 && allRequiredTagsFound && allAdditionalTagsFound.length >= 1) ||
            (requiredTags.length === 0 && allAdditionalTagsFound.length >= 2)
          ) {
            const post = {
              user: userName,
              post: postText,
              profileLink: userProfileLink,
            };

            if (!scrapedPosts.has(JSON.stringify(post))) {
              // console.log(
              //   `Scraped Post ${index + 1} - User: ${userName}, Post: ${postText}, Profile Link: ${userProfileLink}`,
              // );
              scrapedPosts.add(JSON.stringify(post));
            } else {
              console.log(
                `Duplicate Post ${index + 1} - User: ${userName}, Post: ${postText}, Profile Link: ${userProfileLink}`,
              );
            }
          }
        } else {
          console.log(`User profile link not found for Post ${index + 1}`);
        }
      } else {
        console.log(`Post text element not found for Post ${index + 1}`);
      }
    });

    sendPostsToPopup(scrapedPosts);
  } else {
    console.log('Post elements not found');
  }
};

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === 'startCrawling') {
    const tags = request.tags;
    const requiredTags = request.requiredTags;
    scrapedPosts.clear();
    smoothScrollToBottom();
    isScrolling = true;
    // Start scraping post text every 4 seconds
    crawlInterval = setInterval(() => {
      scrapePost(tags, requiredTags);
    }, 4000);
  } else if (request.action === 'stopCrawling') {
    clearInterval(crawlInterval);
    isScrolling = false;
  }
});
