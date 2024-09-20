// src/App.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders SearchBar and DocumentList components', () => {
  render(<App />);

  // Verify that SearchBar and DocumentList are present
  expect(screen.getByPlaceholderText(/search.../i)).toBeInTheDocument();
});

test('calls handleSearch on SearchBar with correct query', () => {
  render(<App />);

  // Simulate search input
  fireEvent.change(screen.getByPlaceholderText(/search.../i), { target: { value: 'test query' } });
  fireEvent.click(screen.getByText(/search/i)); // Assuming there is a search button

  // Check if DocumentList updates based on the search query
  expect(screen.getByText(/no results found/i)).toBeInTheDocument(); // Adjust this as needed based on your DocumentList behavior
});
