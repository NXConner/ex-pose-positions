import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TopNavBar } from "../top-nav-bar";

// Mock child components
vi.mock("../manage-lists", () => ({
  ManageLists: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="manage-lists">Manage Lists</div> : null,
}));

vi.mock("../private-gallery", () => ({
  PrivateGallery: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="private-gallery">Private Gallery</div>
  ),
}));

describe("TopNavBar", () => {
  const defaultProps = {
    onFiltersToggle: vi.fn(),
    onSettingsToggle: vi.fn(),
    searchTerm: "",
    onSearchChange: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should render search input", () => {
    render(<TopNavBar {...defaultProps} />);
    const searchInput = screen.getByLabelText(/search positions/i);
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("type", "search");
  });

  it("should call onSearchChange when typing", () => {
    render(<TopNavBar {...defaultProps} />);
    const searchInput = screen.getByLabelText(/search positions/i);
    
    fireEvent.change(searchInput, { target: { value: "test" } });
    
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("test");
  });

  it("should display search term", () => {
    render(<TopNavBar {...defaultProps} searchTerm="test query" />);
    const searchInput = screen.getByLabelText(/search positions/i);
    expect(searchInput).toHaveValue("test query");
  });

  it("should show search suggestions when focused", async () => {
    localStorage.setItem("search_history", JSON.stringify(["previous search", "another"]));
    
    render(<TopNavBar {...defaultProps} />);
    const searchInput = screen.getByLabelText(/search positions/i);
    
    fireEvent.focus(searchInput);
    
    await waitFor(() => {
      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    });
  });

  it("should save search to history on submit", () => {
    render(<TopNavBar {...defaultProps} searchTerm="new search" />);
    const searchInput = screen.getByLabelText(/search positions/i);
    
    fireEvent.focus(searchInput);
    fireEvent.keyDown(searchInput, { key: "Enter" });
    
    const history = JSON.parse(localStorage.getItem("search_history") || "[]");
    expect(history).toContain("new search");
  });

  it("should clear search when clear button is clicked", () => {
    const onSearchChange = vi.fn();
    render(<TopNavBar {...defaultProps} searchTerm="test" onSearchChange={onSearchChange} />);
    
    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);
    
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("should show search results counter", () => {
    render(
      <TopNavBar
        {...defaultProps}
        searchTerm="test"
        searchResults={{ total: 100, matches: 25 }}
      />
    );
    
    expect(screen.getByText("25/100")).toBeInTheDocument();
  });

  it("should call onFiltersToggle when filters button is clicked", () => {
    render(<TopNavBar {...defaultProps} />);
    
    const filtersButton = screen.getByLabelText("Toggle filters");
    fireEvent.click(filtersButton);
    
    expect(defaultProps.onFiltersToggle).toHaveBeenCalledTimes(1);
  });

  it("should call onSettingsToggle when settings button is clicked", () => {
    render(<TopNavBar {...defaultProps} />);
    
    const settingsButton = screen.getByLabelText("Toggle settings");
    fireEvent.click(settingsButton);
    
    expect(defaultProps.onSettingsToggle).toHaveBeenCalledTimes(1);
  });

  it("should close suggestions when clicking outside", async () => {
    localStorage.setItem("search_history", JSON.stringify(["test"]));
    
    render(<TopNavBar {...defaultProps} />);
    const searchInput = screen.getByLabelText(/search positions/i);
    
    fireEvent.focus(searchInput);
    
    await waitFor(() => {
      expect(screen.getByText("Recent Searches")).toBeInTheDocument();
    });
    
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText("Recent Searches")).not.toBeInTheDocument();
    });
  });
});

