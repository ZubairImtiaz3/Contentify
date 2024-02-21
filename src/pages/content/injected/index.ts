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

const smoothScrollToBottom = () => {
  const scrollStep = window.innerHeight / 10;
  let scrollCount = 0;

  const scrollInterval = setInterval(() => {
    if (scrollCount >= document.body.scrollHeight - window.innerHeight) {
      clearInterval(scrollInterval);
    } else {
      window.scrollTo(0, scrollCount);
      scrollCount += scrollStep;
    }
  }, 15);
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'startScrolling') {
    // Your code to start scrolling here
    smoothScrollToBottom();
    sendResponse({ message: 'Scrolling started' });
  }
});

