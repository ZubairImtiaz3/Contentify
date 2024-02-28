import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import TagsInput from 'react-tagsinput';

const Popup = () => {
  const [tags, setTags] = useState([]);
  const [scrapedData, setScrapedData] = useState([]);
  const [requiredTags, setRequiredTags] = useState([]);
  const [isCrawling, setIsCrawling] = useState(false);

  const handleTagsChange = newTags => {
    setTags(newTags);
  };

  const handleRequiredTagsChange = newRequiredTags => {
    setRequiredTags(newRequiredTags);
  };

  const toggleCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      if (isCrawling) {
        chrome.tabs.sendMessage(tabId, { action: 'stopCrawling' });
      } else {
        chrome.tabs.sendMessage(tabId, { action: 'startCrawling', tags, requiredTags });
      }

      setIsCrawling(!isCrawling);
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
        <TagsInput
          inputProps={{ placeholder: 'Add keywords' }}
          id="requiredTags"
          value={requiredTags}
          onChange={handleRequiredTagsChange}
        />

        <label htmlFor="additionalTags">Additional keywords:</label>
        <TagsInput
          inputProps={{ placeholder: 'Add keywords' }}
          id="additionalTags"
          value={tags}
          onChange={handleTagsChange}
        />

        <div className="btnGroup">
          <button className={`btn ${isCrawling ? 'btnStop' : 'btnStart'}`} onClick={toggleCrawling}>
            {isCrawling ? 'Stop Crawling' : 'Start Crawling'}
          </button>
          <div className="secondaryBtnGroup">
            {scrapedData.length > 0 && (
              <>
                <button className="btn secondaryBtn" onClick={openNewTab}>
                  Open in New Window
                </button>
                <button className="btn secondaryBtn" onClick={downloadCSV}>
                  Download CSV
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
