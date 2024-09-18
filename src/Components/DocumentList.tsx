import React, { useState, useEffect } from "react";
import "./DocumentList.css";

interface DocumentItem {
  DocumentId: string;
  DocumentTitle?: { Text: string };
  DocumentExcerpt?: { Text: string };
  DocumentURI: string;
}

interface DocumentListProps {
  query: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ query }) => {
  const [results, setResults] = useState<DocumentItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [displayedResults, setDisplayedResults] = useState<number>(10); // Number of results to display
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number

  useEffect(() => {
    if (query) {
      fetch(
        "https://gist.githubusercontent.com/yuhong90/b5544baebde4bfe9fe2d12e8e5502cbf/raw/44deafab00fc808ed7fa0e59a8bc959d255b9785/queryResult.json"
      )
        .then((response) => response.json())
        .then(
          (data: {
            ResultItems: DocumentItem[];
            TotalNumberOfResults: number;
          }) => {
            const resultArray = data.ResultItems || [];
            setResults(resultArray);
            setTotalResults(data.TotalNumberOfResults || resultArray.length);
          }
        )
        .catch((error) =>
          console.error("Error fetching search results:", error)
        );
    }
  }, [query]);

  const highlightText = (text: string | undefined, highlight: string) => {
    if (!text || !highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleNextPage = () => {
    if (currentPage * displayedResults < totalResults) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const resultsToDisplay = results.slice(
    (currentPage - 1) * displayedResults,
    currentPage * displayedResults
  );

  return (
    <div className="search-results">
      {results.length > 0 ? (
        <>
          <p className="result-count">
            Showing {((currentPage - 1) * displayedResults) + 1}-
            {Math.min(currentPage * displayedResults, totalResults)} of{" "}
            {totalResults} results
          </p>
          <ul>
            {resultsToDisplay.map((result, index) => (
              <li key={index}>
                <a
                  href={result.DocumentURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="title"
                >
                  <strong>{result.DocumentTitle?.Text}</strong>
                </a>
                <p>{highlightText(result.DocumentExcerpt?.Text, query)}</p>
                <a
                  href={result.DocumentURI}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uri"
                >
                  {result.DocumentURI}
                </a>
              </li>
            ))}
          </ul>
          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * displayedResults >= totalResults}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default DocumentList;
