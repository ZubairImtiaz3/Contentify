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
  const [currentTabUrl, setCurrentTabUrl] = useState('');
  const [showTagErrorMessage, setShowTagErrorMessage] = useState(false);
  const [rememberKeywords, setRememberKeywords] = useState(false);

  const handleTagsChange = newTags => {
    setTags(newTags);
    setShowTagErrorMessage(false);
    if (rememberKeywords) {
      chrome.storage.sync.set({ rememberedTags: newTags, rememberedRequiredTags: requiredTags });
    }
  };

  const handleRequiredTagsChange = newRequiredTags => {
    setRequiredTags(newRequiredTags);
    setShowTagErrorMessage(false);
    if (rememberKeywords) {
      chrome.storage.sync.set({ rememberedTags: tags, rememberedRequiredTags: newRequiredTags });
    }
  };

  const toggleCrawling = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tabId = tabs[0].id;

      if (tags.length === 0 && requiredTags.length === 0) {
        setShowTagErrorMessage(true);
        return;
      }

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

  const handleCloseClick = () => {
    window.close(); // Close the popup
  };

  useEffect(() => {
    // Retrieve remembered keywords from Chrome storage when the component mounts
    chrome.storage.sync.get(['rememberedTags', 'rememberedRequiredTags'], data => {
      if (data.rememberedTags && data.rememberedRequiredTags) {
        setTags(data.rememberedTags);
        setRequiredTags(data.rememberedRequiredTags);
        setRememberKeywords(true);
      }
    });
  }, []);

  // Save or remove remembered keywords based on the state of the checkbox
  useEffect(() => {
    if (rememberKeywords) {
      chrome.storage.sync.set({ rememberedTags: tags, rememberedRequiredTags: requiredTags });
    } else {
      chrome.storage.sync.remove(['rememberedTags', 'rememberedRequiredTags']);
    }
  }, [rememberKeywords, tags, requiredTags]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(message => {
      if (message.action === 'scrapedData') {
        setScrapedData(message.data);
      }
    });
  }, []);

  useEffect(() => {
    // Get the current tab URL using chrome.tabs.query
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentTabUrl(tabs[0].url || '');
    });
  }, []);

  return (
    <div className="App">
      <h1>Contentify</h1>
      <section>
        {currentTabUrl.startsWith('https://www.linkedin.com/') ? (
          <>
            {scrapedData.length > 0 && <h3>Total Posts Found: {scrapedData.length}</h3>}

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

            <div id="keysCheckBox">
              <input
                type="checkbox"
                name="RememberKeys"
                id="rememberKeys"
                checked={rememberKeywords}
                onChange={() => setRememberKeywords(!rememberKeywords)}
              />
              <label htmlFor="rememberKeys">Remember Keywords</label>
            </div>

            <div className="btnGroup">
              {showTagErrorMessage && <p className="tagErrorMessage">Please add keywords before starting.</p>}

              <button className="btn" onClick={toggleCrawling}>
                {isCrawling ? 'Stop Search' : 'Start Search'}
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
          </>
        ) : (
          <>
            <div id="validationError">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="errorIcon"
                data-id="5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" x2="12" y1="8" y2="12"></line>
                <line x1="12" x2="12.01" y1="16" y2="16"></line>
              </svg>
              <h3>This extension is designed to work only on LinkedIn.</h3>
              <h3>Please visit the LinkedIn feed to use this extension.</h3>
              <button className="btn btnClose" onClick={handleCloseClick}>
                Close
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
