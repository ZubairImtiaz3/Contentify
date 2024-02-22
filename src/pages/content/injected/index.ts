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
  const baseScrollStep = window.innerHeight / 60;
  let scrollCount = 0;

  const scroll = () => {
    if (scrollCount >= document.body.scrollHeight - window.innerHeight) {
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'startScrolling') {
    smoothScrollToBottom();
    sendResponse({ message: 'Scrolling started' });
  }
});

