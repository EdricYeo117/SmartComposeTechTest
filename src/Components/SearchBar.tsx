import React, {
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
  useRef,
} from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import "./SearchBar.css";

// Defining the structure of SearchBar Props
interface SearchBarProps {
  onSearch: (query: string) => void; // Function to handle search action
}

// SearchBar Component
const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // Destructuring onSearch from props
  const [input, setInput] = useState<string>(""); // State to store search input
  const [suggestions, setSuggestions] = useState<string[]>([]); // State to store search suggestions
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]); // State to store filtered suggestions
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false); // State to toggle suggestion dropdown
  const [highlightIndex, setHighlightIndex] = useState<number>(-1); // State to highlight suggestion

  // Refs for input and container elements (this is to avoid weird double-click error for suggestions dropdown menu)
  const inputRef = useRef<HTMLInputElement>(null); // Ref for input element
  const containerRef = useRef<HTMLDivElement>(null); // Ref for container element

  // Fetching search suggestions from the provided endpoint
  useEffect(() => {
    fetch(
      "https://gist.githubusercontent.com/yuhong90/b5544baebde4bfe9fe2d12e8e5502cbf/raw/e026dab444155edf2f52122aefbb80347c68de86/suggestion.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setSuggestions(data.suggestions);
      })
      .catch((error) => console.error("Error fetching suggestions:", error));
  }, []);

  useEffect(() => {
    if (input.length > 2) {
      const filtered = suggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(input.toLowerCase())
        )
        .slice(0, 6); // Show top 6 results
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
  // Fetching suggestions from the API on initial component mount using Axios
  useEffect(() => {
    axios
      .get(
        "https://gist.githubusercontent.com/yuhong90/b5544baebde4bfe9fe2d12e8e5502cbf/raw/e026dab444155edf2f52122aefbb80347c68de86/suggestion.json"
      )
      .then((response) => {
        setSuggestions(response.data.suggestions); // Storing the fetched suggestions in state
      })
      .catch((error) => console.error("Error fetching suggestions:", error)); // Logging errors, if any
  }, []); // Empty dependency array means this effect runs only once (on mount)

  // Filtering suggestions based on the user's input
  useEffect(() => {
    if (input.length > 2) {
      // Start filtering when input is longer than 2 characters
      const filtered = suggestions
        .filter(
          (suggestion) => suggestion.toLowerCase().includes(input.toLowerCase()) // Filtering suggestions based on input
        )
        .slice(0, 6); // Limiting to the top 6 results
      setFilteredSuggestions(filtered); // Updating the filtered suggestions state
      setShowSuggestions(true); // Showing the suggestions dropdown
    } else {
      setFilteredSuggestions([]); // Clearing filtered suggestions if input is too short
      setShowSuggestions(false); // Hiding the suggestions dropdown
    }
  }, [input, suggestions]); // Runs whenever input or suggestions change

  // Handling clicks outside of the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false); // Closing the suggestions dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Adding event listener for mouse clicks
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Cleaning up the event listener on unmount
    };
  }, []); */ // Unable to use axios, due to jest mock error

  // Function to handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHighlightIndex(-1);
  };

  // Function to handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      e.preventDefault();
    } else if (e.key === "Enter") {
      e.preventDefault(); // Prevent default form submission
      const selectedSuggestion = filteredSuggestions[highlightIndex];
      if (selectedSuggestion) {
        setInput(selectedSuggestion);
        onSearch(selectedSuggestion);
      } else {
        onSearch(input);
      }
      // Delay hiding suggestions to ensure search action completes
      setTimeout(() => setShowSuggestions(false), 0);
    }
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    onSearch(suggestion);
    // Delay hiding suggestions to ensure search action completes
    setTimeout(() => setShowSuggestions(false), 0);
  };
  
  // Function to handle search action
  const handleSearch = () => {
    onSearch(input);
    setShowSuggestions(false); // Hide dropdown immediately
  };

  // Function to clear the input
  const handleClear = () => {
    setInput("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus(); // Keep input focused after clearing
    }
  };

  return (
    <div className="search-bar-card"> {/* Main container for the search bar */}
    <div className="search-bar" ref={containerRef}> {/* Wrapper for the search bar and suggestions */}
      <div className="input-wrapper"> {/* Wrapper for input and buttons */}
        <div className="input-clear-wrapper"> {/* Wrapper for input and clear button */}
          <div className="input-suggestions-wrapper"> {/* Wrapper for input and suggestions dropdown */}
              <input
                type="text"
                value={input}
                onChange={handleInputChange} // On input change
                onKeyDown={handleKeyDown} // On key down
                placeholder="Search..." // Placeholder text
                ref={inputRef} // Ref for input element
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="search-suggestions"> {/* Suggestions dropdown */}
                  <ul>
                    {filteredSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)} // On suggestion click
                        onMouseDown={(e) => e.preventDefault()} // Prevents input blur on suggestion click
                        className={index === highlightIndex ? "highlight" : ""} // Highlight the selected suggestion
                      >
                        {suggestion} {/* Display the suggestion */}
                      </li> 
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {input && (
              <button className="search-bar-clear" onClick={handleClear}> {/* Clear button */}
                X
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="search-button"> {/* Search button */}
            <FaSearch className="search-icon" /> Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
