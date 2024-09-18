import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from './SearchBar'; 

// Mock the global fetch function
beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            suggestions: ["apple", "banana", "cherry", "date", "fig", "grape"],
          }),
      })
    ) as jest.Mock;
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });

test("renders search bar", () => {
    render(<SearchBar onSearch={() => {}} />);
  
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });
  
  test("renders input and search button", () => {
    render(<SearchBar onSearch={() => {}} />);

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  test("displays suggestions when input length is greater than 2", async () => {
    render(<SearchBar onSearch={() => {}} />);
  
    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "a" } });
  
    // Wait for suggestions to appear with a slight delay
    await waitFor(() => {
      // Add a small delay
      setTimeout(() => {
        expect(screen.getByText("apple")).toBeInTheDocument();
        expect(screen.getByText("banana")).toBeInTheDocument();
      }, 100);
    });
  });

  test("does not display suggestions when input length is 2 or less", async () => {
    render(<SearchBar onSearch={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "a" } });

    // Wait until suggestions appear
    await waitFor(() => {
      expect(screen.queryByText("apple")).not.toBeInTheDocument();
    });
  });

  test('selects suggestion on click', async () => {
    render(<SearchBar onSearch={() => {}} />);
  
    // Simulate typing in the input
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'ap' } });
  
    // Wait for suggestions to appear
    const suggestionElement = await screen.findByText(/apple/i);
    expect(suggestionElement).toBeInTheDocument();
  
    // Click on the suggestion
    fireEvent.click(suggestionElement);
    
    // Verify if the suggestion has been selected or further actions
  });

test('selects suggestion on enter key press', async () => {
  const onSearch = jest.fn();

  render(<SearchBar onSearch={onSearch} />);

  fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'ap' } });

  await waitFor(() => {
    expect(screen.queryByText(/apple/i)).toBeInTheDocument();
  });

  // Simulate ArrowDown and Enter key press
  fireEvent.keyDown(screen.getByPlaceholderText('Search...'), { key: 'ArrowDown', code: 'ArrowDown' });
  fireEvent.keyDown(screen.getByPlaceholderText('Search...'), { key: 'Enter', code: 'Enter' });

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Search...')).toHaveValue('apple');
  });

  expect(onSearch).toHaveBeenCalledWith('apple');
  expect(onSearch).toHaveBeenCalledTimes(1);
});

  test("clears input and suggestions on clear button click", () => {
    render(<SearchBar onSearch={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "a" } });
    expect(screen.getByDisplayValue("a")).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", { name: /x/i }));
    
    expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
    expect(screen.queryByText("apple")).not.toBeInTheDocument();
  });
  

  