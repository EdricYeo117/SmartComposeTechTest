// src/App.js
import React, { useState } from 'react';
import Header from './Components/Header.js';
import SearchBar from './Components/SearchBar.tsx';
import DocumentList from './Components/DocumentList.tsx';
import './App.css';

function App() {
  const [query, setQuery] = useState('');

  const handleSearch = (searchTerm) => {
    setQuery(searchTerm);
  };

  return (
    <div className="App">
      <Header />
      <SearchBar onSearch={handleSearch} />
      <DocumentList query={query} />
    </div>
  );
}

export default App;
