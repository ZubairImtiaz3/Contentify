import { useState, useEffect } from 'react';
import Papa from 'papaparse';
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
  const [scrapedData, setScrapedData] = useState([]);
  const [requiredTags, setRequiredTags] = useState([]);

  const handleTagsChange = newTags => {
    setTags(newTags);
    console.log('Tags:', newTags);
  };

  const handleRequiredTagsChange = newRequiredTags => {
    setRequiredTags(newRequiredTags);
    console.log('Required Tags:', newRequiredTags);
  };

  const startCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, { action: 'startCrawling', tags: tags, requiredTags: requiredTags });
    });
  };

  const stopCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      chrome.tabs.sendMessage(tabId, { action: 'stopCrawling' });
    });
  };

  const convertToCSV = data => {
    const csv = Papa.unparse(data);
    return csv;
  };

  const downloadCSV = () => {
    const csvData = convertToCSV(scrapedData);

    // Create a Blob object representing the data as a CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'scrapedData.csv';
    link.click();
  };

  useEffect(() => {
    // Listen for messages from the content script
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'scrapedData') {
        setScrapedData(prevData => [...prevData, message.data]);
      }
    });

    console.log('scrapedData', scrapedData);
  }, [scrapedData]);

  return (
    <div
      className="App"
      style={{
        backgroundColor: theme === 'light' ? '#fff' : '#000',
      }}>
      <header className="App-header" style={{ color: theme === 'light' ? '#000' : '#fff' }}>
        <section>
          <h3
            style={{
              margin: '0px',
            }}>
            Total Crawled Posts: {scrapedData.length}
          </h3>
          <button
            style={{
              backgroundColor: theme === 'light' ? '#fff' : '#000',
              color: theme === 'light' ? '#000' : '#fff',
            }}
            onClick={exampleThemeStorage.toggle}>
            Toggle theme
          </button>
          <label htmlFor="requiredTags" style={{ color: theme === 'light' ? '#000' : '#fff', fontSize: '14px' }}>
            Required keywords:
          </label>
          <TagsInput id="requiredTags" value={requiredTags} onChange={handleRequiredTagsChange} />
          <label htmlFor="additionalTags" style={{ color: theme === 'light' ? '#000' : '#fff', fontSize: '14px' }}>
            Additional keywords:
          </label>
          <TagsInput id="additionalTags" value={tags} onChange={handleTagsChange} />
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
          {scrapedData.length > 0 && (
            <button
              onClick={downloadCSV}
              style={{
                backgroundColor: theme === 'light' ? '#fff' : '#000',
                color: theme === 'light' ? '#000' : '#fff',
              }}>
              Download CSV
            </button>
          )}
        </section>
      </header>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
