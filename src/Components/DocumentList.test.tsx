import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DocumentList from "./DocumentList";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          ResultItems: [
            {
              DocumentId: "1",
              DocumentTitle: { Text: "Test Title" },
              DocumentExcerpt: { Text: "This is a test excerpt containing the query term" },
              DocumentURI: "http://example.com/test",
            },
          ],
          TotalNumberOfResults: 1,
        }),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks(); // Clear mock after each test
});


test("fetches and displays results", async () => {
  render(<DocumentList query="query" />);

  // Use `findBy` queries for better handling of async content
  const resultCount = await screen.findByText(/Showing 1-1 of 1 results/);
  const title = await screen.findByText("Test Title");

  // Custom matcher function to find the text in the HTML structure
  const excerpt = await screen.findByText((content, element) => {
    return (
      content.includes("This is a test excerpt containing the") &&
      element?.querySelector(".highlight")?.textContent === "query" &&
      content.includes("term")
    );
  });

  expect(resultCount).toBeInTheDocument();
  expect(title).toBeInTheDocument();
  expect(excerpt).toBeInTheDocument();
});


test("handles pagination", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          ResultItems: new Array(20).fill(null).map((_, index) => ({
            DocumentId: index.toString(),
            DocumentTitle: { Text: `Title ${index}` },
            DocumentExcerpt: { Text: `Excerpt ${index}` },
            DocumentURI: `http://example.com/${index}`,
          })),
          TotalNumberOfResults: 20,
        }),
    })
  ) as jest.Mock;

  render(<DocumentList query="query" />);

  await waitFor(() => {
    expect(screen.getByText(/Showing 1-10 of 20 results/)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText("Next"));

  await waitFor(() => {
    expect(screen.getByText(/Showing 11-20 of 20 results/)).toBeInTheDocument();
  });
});
