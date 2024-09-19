import React, { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null); 
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredSuggestions.length - 1)
      );
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prevIndex) =>
        Math.max(prevIndex - 1, 0)
      );
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    onSearch(suggestion);
    // Delay hiding suggestions to ensure search action completes
    setTimeout(() => setShowSuggestions(false), 0);
  };

  const handleSearch = () => {
    onSearch(input);
    setShowSuggestions(false); // Hide dropdown immediately
  };

  const handleClear = () => {
    setInput("");
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus(); // Keep input focused after clearing
    }
  };

  return (
    <div className="search-bar-card"> {/* Card container with shadow */}
    <div className="search-bar" ref={containerRef}>
      <div className="input-wrapper">
        <div className="input-clear-wrapper">
          <div className="input-suggestions-wrapper">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              ref={inputRef}
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="search-suggestions">
                <ul>
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()}
                      className={index === highlightIndex ? "highlight" : ""}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {input && (
            <button className="search-bar-clear" onClick={handleClear}>
              X
            </button>
          )}
        </div>
        <button onClick={handleSearch} className="search-button">
          <FaSearch className="search-icon" /> Search
        </button>
      </div>
    </div>
  </div>
  );
};

export default SearchBar;
