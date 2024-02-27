import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';

const Popup = () => {
  const [tags, setTags] = useState([]);
  const [scrapedData, setScrapedData] = useState([]);
  const [requiredTags, setRequiredTags] = useState([]);

  const handleTagsChange = newTags => {
    setTags(newTags);
  };

  const handleRequiredTagsChange = newRequiredTags => {
    setRequiredTags(newRequiredTags);
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

  const openNewTab = () => {
    const newTabUrl = chrome.runtime.getURL('src/pages/newtab/index.html');
    chrome.windows.create({ url: newTabUrl, state: 'maximized' }, function (window) {
      setTimeout(() => {
        chrome.tabs.sendMessage(window.tabs[0].id, { action: 'displayScrapedData', data: scrapedData });
        console.log('scrapedSend', scrapedData);
      }, 1000);
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
    link.download = 'Posts.csv';
    link.click();
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'scrapedData') {
        setScrapedData(message.data);
      }
    });
  }, []);

  return (
    <div className="App">
      <section>
        <h1>Feed Opportunity</h1>
        {scrapedData.length > 0 && <h3>Total Crawled Posts: {scrapedData.length}</h3>}

        <label htmlFor="requiredTags">Required keywords:</label>
        <TagsInput id="requiredTags" value={requiredTags} onChange={handleRequiredTagsChange} />

        <label htmlFor="additionalTags">Additional keywords:</label>
        <TagsInput id="additionalTags" value={tags} onChange={handleTagsChange} />

        <button onClick={startCrawling}>Start Crawling</button>
        <button onClick={stopCrawling}>Stop Crawling</button>

        {scrapedData.length > 0 && (
          <>
            <button onClick={openNewTab}>Open in New Window</button>
            <button onClick={downloadCSV}>Download CSV</button>
          </>
        )}
      </section>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
