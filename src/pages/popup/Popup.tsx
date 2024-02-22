import React, { useState } from 'react';
// import logo from '@assets/img/logo.svg';
import '@pages/popup/Popup.css';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

const Popup = () => {
  const theme = useStorage(exampleThemeStorage);
  const [tags, setTags] = useState([]);

  const handleTagsChange = newTags => {
    setTags(newTags);
    console.log('Tags:', newTags);
  };

  const startCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, { action: 'startCrawling' });
    });
  };

  const stopCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, { action: 'stopCrawling' });
    });
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#000',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
        <section>
          <button
            style={{
              backgroundColor: theme === 'light' ? '#fff' : '#000',
              color: theme === 'light' ? '#000' : '#fff',
            }}
            onClick={exampleThemeStorage.toggle}>
            Toggle theme
          </button>
          <TagsInput value={tags} onChange={handleTagsChange} />
          <button
            onClick={startCrawling}
            style={{
              backgroundColor: theme === 'light' ? '#fff' : '#000',
              color: theme === 'light' ? '#000' : '#fff',
            }}>
            Start Crawling
          </button>
          <button
            onClick={stopCrawling}
            style={{
              backgroundColor: theme === 'light' ? '#fff' : '#000',
              color: theme === 'light' ? '#000' : '#fff',
            }}>
            Stop Crawling
          </button>
        </section>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
