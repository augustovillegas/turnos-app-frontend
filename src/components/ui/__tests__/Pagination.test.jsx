import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Pagination } from "../Pagination.jsx";

const Wrapper = ({ totalItems = 10, itemsPerPage = 5 }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const items = Array.from({ length: totalItems }, (_, index) => index + 1);
  const start = (currentPage - 1) * itemsPerPage;
  const visible = items.slice(start, start + itemsPerPage);

  return (
    <div>
      <div data-testid="current-page">{currentPage}</div>
      <ul data-testid="visible-items">
        {visible.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setPage}
      />
    </div>
  );
};

describe("Pagination", () => {
  it("changes page when next button is clicked", async () => {
    render(<Wrapper totalItems={10} itemsPerPage={5} />);

    expect(screen.getByTestId("current-page").textContent).toBe("1");
    expect(screen.getByTestId("visible-items").textContent).toBe("12345");

    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(screen.getByTestId("current-page").textContent).toBe("2");
    expect(screen.getByTestId("visible-items").textContent).toBe("678910");
  });
});
