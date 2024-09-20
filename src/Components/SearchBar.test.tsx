import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "./SearchBar";

// Mock the global fetch function
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          suggestions: [
            "child care",
            "child vaccination",
            "child health",
            "child education",
            "child development account",
            "register childcare",
          ],
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

  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "chi" },
  });

  // Wait for suggestions to appear
  await waitFor(() => {
    expect(screen.getByText("child care")).toBeInTheDocument();
  });
});

test("does not display suggestions when input length is 2 or less", async () => {
  render(<SearchBar onSearch={() => {}} />);

  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "a" },
  });

  // Wait until suggestions appear
  await waitFor(() => {
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });
});

test("selects suggestion on click", async () => {
  const onSearch = jest.fn();

  render(<SearchBar onSearch={onSearch} />);

  // Simulate typing in the input
  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "chi" },
  });

  // Wait for the suggestion to appear
  const suggestionElement = await screen.findByText("child care");

  // Click on the suggestion
  fireEvent.click(suggestionElement);

  // Assert that the input value is updated and the search is triggered
  expect(screen.getByPlaceholderText("Search...")).toHaveValue("child care");
  expect(onSearch).toHaveBeenCalledWith("child care");
});

test("selects suggestion on enter key press", async () => {
  const onSearch = jest.fn();

  render(<SearchBar onSearch={onSearch} />);

  // Simulate typing in the input
  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "chi" },
  });

  // Wait for the suggestion to appear
  await waitFor(() => {
    expect(screen.getByText("child care")).toBeInTheDocument();
  });

  // Simulate ArrowDown and Enter key press
  fireEvent.keyDown(screen.getByPlaceholderText("Search..."), {
    key: "ArrowDown",
    code: "ArrowDown",
  });
  fireEvent.keyDown(screen.getByPlaceholderText("Search..."), {
    key: "Enter",
    code: "Enter",
  });

  // Wait for the input to update with the selected suggestion
  await waitFor(() => {
    expect(screen.getByPlaceholderText("Search...")).toHaveValue("child care");
  });

  expect(onSearch).toHaveBeenCalledWith("child care");
  expect(onSearch).toHaveBeenCalledTimes(1);
});

test("clears input and suggestions on clear button click", () => {
  render(<SearchBar onSearch={() => {}} />);

  fireEvent.change(screen.getByPlaceholderText("Search..."), {
    target: { value: "a" },
  });
  expect(screen.getByDisplayValue("a")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /x/i }));

  expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});
