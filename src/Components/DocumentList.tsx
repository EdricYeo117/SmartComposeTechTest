import React, { useState, useEffect } from "react";
import "./DocumentList.css";
import axios from "axios";

// Defining the structure of Document Item
interface DocumentItem {
  DocumentId: string;
  DocumentTitle?: { Text: string }; // Title of the document
  DocumentExcerpt?: { Text: string }; // Excerpt of the document
  DocumentURI: string; // URI of the document
  DocumentDate?: string; // Not included in json, but it is needed in the mock up
}

// Defining the structure of Document List Props
interface DocumentListProps {
  query: string; // Search query
}

// Document List Component
const DocumentList: React.FC<DocumentListProps> = ({ query }) => {
  const [results, setResults] = useState<DocumentItem[]>([]); // State to store search results
  const [totalResults, setTotalResults] = useState<number>(0); // State to hold total number of results
  const [displayedResults, setDisplayedResults] = useState<number>(10); // Number of results to display per page
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page number for pagination, not required but added for better user experience

  /*
  //Fetching search results from the provided endpoint
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
            const resultArray = data.ResultItems || []; // Get the result items from the response or set it to an empty array
            setResults(resultArray); // Set the search results
            setTotalResults(data.TotalNumberOfResults || resultArray.length); // Set the total number of results
          }
        )
        .catch((error) =>
          console.error("Error fetching search results:", error) // Log the error if any
        );
    }
  }, [query]); // Fetch the search results whenever the query changes */ // This is the original not using axios

  // Fetching search results from the provided endpoint using axios
  useEffect(() => {
    if (query) {
      axios
        .get(
          "https://gist.githubusercontent.com/yuhong90/b5544baebde4bfe9fe2d12e8e5502cbf/raw/44deafab00fc808ed7fa0e59a8bc959d255b9785/queryResult.json"
        )
        .then((response) => {
          const data = response.data;
          const resultArray = data.ResultItems || [];
          setResults(resultArray);
          setTotalResults(data.TotalNumberOfResults || resultArray.length);
        })
        .catch((error) =>
          console.error("Error fetching search results:", error)
        );
    }
  }, [query]);

  // Function to filter results based on the query, allowing for any subset word matches 
  const filterResults = (results: DocumentItem[], query: string) => {
    // Split the query into individual terms (split by space), removing any extra spaces
    const queryTerms = query.toLowerCase().split(" ").filter(Boolean); // filter(Boolean) removes empty strings from the array

    // Create a Set to hold the filtered results
    const filteredResults = new Set<DocumentItem>();

    // Loop through each term in the query and find matching results
    queryTerms.forEach((term) => {
      results.forEach((item) => {
        // Lowercase title and excerpt for case-insensitive comparison
        const titleText = item.DocumentTitle?.Text.toLowerCase() || "";
        const excerptText = item.DocumentExcerpt?.Text.toLowerCase() || "";

        // If the term is found in either title or excerpt, add the item to the result set
        if (titleText.includes(term) || excerptText.includes(term)) {
          filteredResults.add(item); // Using a Set ensures no duplicates
        }
      });
    });

    // Convert the Set back to an array
    return Array.from(filteredResults);
  };

  // Filter the results based on the query
  const filteredResults = filterResults(results, query);

  /* // Function to highlight the search query in the document excerpt [Bolding]
  const highlightText = (text: string | undefined, highlight: string) => {
    if (!text || !highlight) return text; // Return the text as it is if either text or highlight is not provided
    const parts = text.split(new RegExp(`(${highlight})`, "gi")); // Split the text based on the highlight query
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? ( //Check if the part is equal to the highlight query
        <span key={index} className="highlight">
          {part}
        </span> // Highlight the part if it is equal to the highlight query
      ) : (
        part // Return the part as it is if it is not equal to the highlight query
      )
    );
  }; */ // This function highlights the search query as one entity, so "Social Development" will be checked as a whole

  // Function to highlight the search query in the document excerpt [Bolding] (Highlights any relevant search terms in the input)
  const highlightText = (text: string | undefined, highlight: string) => {
    if (!text || !highlight) return text; // Return the text as is if either text or highlight is not provided
  
    // Split the highlight query into individual terms
    const highlightTerms = highlight.toLowerCase().split(" ").filter(Boolean); // filter(Boolean) removes empty strings
  
    // Create a regex pattern to match any of the highlight terms
    const regexPattern = new RegExp(`(${highlightTerms.join("|")})`, "gi");
  
    // Split the text based on the regex pattern
    const parts = text.split(regexPattern);
  
    // Map over each part and wrap matches in a span to highlight them
    return parts.map((part, index) =>
      highlightTerms.includes(part.toLowerCase()) ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Function to generate placeholder dates
  const formatPlaceholderDate = () => {
    const randomYear = Math.floor(Math.random() * (2023 - 2010 + 1)) + 2010; // Generate a random year between 2010 and 2023
    const randomMonth = Math.floor(Math.random() * 12); // Generate a random month between 0 and 11
    const randomDay = Math.floor(Math.random() * 28) + 1; // Generate a random day between 1 and 28

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${randomDay} ${months[randomMonth]} ${randomYear}`; // Return the formatted date
  };

  // Function to handle the next page click, not needed for the current implementation
  const handleNextPage = () => {
    if (currentPage * displayedResults < totalResults) {
      setCurrentPage((prevPage) => prevPage + 1); // Increment the current page number
    }
  };

  // Function to handle the previous page click, not needed for the current implementation
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1); // Decrement the current page number
    }
  };

  // Slice the results based on the current page and the number of results to display
  const resultsToDisplay = filteredResults.slice(
    (currentPage - 1) * displayedResults,
    currentPage * displayedResults
  );

  return (
    <div className="search-results">
      {query && results.length === 0 ? ( // Only show "No results found" if a query exists and there are no results
        <p>No results found</p>
      ) : results.length > 0 ? ( // Show the results if there are any
        <>
          <p className="result-count">
            Showing {(currentPage - 1) * displayedResults + 1}-
            {Math.min(currentPage * displayedResults, totalResults)} of{" "}
            {totalResults} results
          </p>
          <ul>
            {resultsToDisplay.map(
              (
                result,
                index // Map through the results to display them
              ) => (
                <li key={index}>
                  <a
                    href={result.DocumentURI}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="title"
                  >
                    <strong>{result.DocumentTitle?.Text}</strong>{" "}
                    {/* Display the document title */}
                  </a>
                  <p className="document-info">
                    <span className="document-date">
                      {result.DocumentDate || formatPlaceholderDate()} —{" "}
                      {/* Display the document date or a placeholder date */}
                    </span>
                    <span>
                      {highlightText(result.DocumentExcerpt?.Text, query)}
                    </span>{" "}
                    {/* Display the document excerpt with the search query highlighted */}
                  </p>
                  <a
                    href={result.DocumentURI} // Display the document URI
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uri"
                  >
                    {result.DocumentURI}
                  </a>
                </li>
              )
            )}
          </ul>
          <div className="pagination">
            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
              {" "}
              {/* Disable the previous button if the current page is 1 */}
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage * displayedResults >= totalResults} // Disable the next button if the current page is the last page
            >
              Next
            </button>
          </div>
        </>
      ) : null}{" "}
      {/* Show nothing if there are no results and no query */}
    </div>
  );
};

export default DocumentList;
