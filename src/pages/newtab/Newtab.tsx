import { useEffect, useState } from 'react';
import '@pages/newtab/Newtab.css';
import '@pages/newtab/Newtab.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import ClipLoader from 'react-spinners/ClipLoader';

const Newtab = () => {
  const [scrapedData, setScrapedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const messageListener = message => {
      if (message.action === 'displayScrapedData') {
        setScrapedData(message.data);
        setIsLoading(false);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <div className="App">
      {isLoading ? (
        <ClipLoader color="#000" />
      ) : scrapedData.length > 0 ? (
        <>
          <div className="container-table100">
            <div className="wrap-table100">
              <div className="table100">
                <table>
                  <thead>
                    <tr className="table100-head">
                      <th className="column0">#</th>
                      <th className="column1">Author</th>
                      <th className="column2">Profile</th>
                      <th className="column3">Post</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapedData.map((post, index) => (
                      <tr key={index}>
                        <td className="column0">{index + 1}</td>
                        <td className="column1">{post.user}</td>
                        <td className="column2">
                          <a href={post.profileLink} target="_blank" rel="noopener noreferrer">
                            LinkedIn Profile
                          </a>
                        </td>
                        <td className="column3">{post.post}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>No scraped data available.</p>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Newtab, <div> Loading ... </div>), <div> Error Occur </div>);
