import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PanelFiltro } from "../PanelFiltro";

const sampleData = [
  {
    id: 1,
    nombre: "Ana",
    email: "ana@example.com",
    modulo: "fundamentos",
    cohorte: 1,
    review: 1,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    nombre: "Bruno",
    email: "bruno@example.com",
    modulo: "programacion",
    cohorte: 2,
    review: 2,
    createdAt: "2024-02-12",
  },
  {
    id: 3,
    nombre: "Clara",
    email: "clara@example.com",
    modulo: "fundamentos",
    cohorte: 1,
    review: 1,
    createdAt: "2024-03-15",
  },
];

describe("PanelFiltro UI", () => {
  let onChange;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it("starts collapsed and toggles open on Filtro button", () => {
    render(<PanelFiltro data={sampleData} onChange={onChange} showAlphaSort={false} />);
    // Filters container should not be visible initially
    expect(screen.queryByText(/Módulo/i)).toBeNull();

    // Toggle open
    const toggleBtn = screen.getByRole("button", { name: /Filtro/i });
    fireEvent.click(toggleBtn);

    // Now filter controls should be visible
    expect(screen.getByText(/Módulo/i)).toBeInTheDocument();
  });

  it("applies Review filter and calls onChange with filtered results", () => {
    render(
      <PanelFiltro
        data={sampleData}
        onChange={onChange}
        showAlphaSort={false}
        reviewField="review"
      />
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: /Filtro/i }));

    // Select Review = 1
    const reviewSelect = screen.getByLabelText(/Review/i);
    fireEvent.change(reviewSelect, { target: { value: "1" } });

    // Apply filters
    fireEvent.click(screen.getByRole("button", { name: /Aplicar filtros/i }));

    expect(onChange).toHaveBeenCalled();
    const lastCallArg = onChange.mock.calls.at(-1)?.[0] || [];
    // Two items with review=1
    expect(lastCallArg).toHaveLength(2);
    expect(lastCallArg.map((x) => x.id).sort()).toEqual([1, 3]);
  });

  it("reset returns full dataset via onChange", () => {
    render(
      <PanelFiltro
        data={sampleData}
        onChange={onChange}
        showAlphaSort={false}
        reviewField="review"
      />
    );

    // Open panel and select Review = 2
    fireEvent.click(screen.getByRole("button", { name: /Filtro/i }));
    fireEvent.change(screen.getByLabelText(/Review/i), { target: { value: "2" } });

    // Apply filters to ensure onChange has filtered result
    fireEvent.click(screen.getByRole("button", { name: /Aplicar filtros/i }));
    expect(onChange).toHaveBeenCalled();

    // Reset filters
    fireEvent.click(screen.getByRole("button", { name: /Limpiar filtros/i }));

    // Last call should be full dataset
    const lastCallArg = onChange.mock.calls.at(-1)?.[0] || [];
    expect(lastCallArg).toHaveLength(sampleData.length);
    expect(lastCallArg.map((x) => x.id).sort()).toEqual(sampleData.map((x) => x.id).sort());
  });
});