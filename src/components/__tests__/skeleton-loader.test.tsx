import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SkeletonLoader,
  ImageSkeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
} from "../skeleton-loader";

describe("SkeletonLoader", () => {
  it("should render with default props", () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByLabelText("Loading...");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("should render with custom width and height", () => {
    render(<SkeletonLoader width={200} height={100} />);
    const skeleton = screen.getByLabelText("Loading...");
    expect(skeleton).toHaveStyle({ width: "200px", height: "100px" });
  });

  it("should render rounded variant", () => {
    render(<SkeletonLoader rounded />);
    const skeleton = screen.getByLabelText("Loading...");
    expect(skeleton.className).toContain("rounded-full");
  });

  it("should render multiple lines", () => {
    render(<SkeletonLoader lines={3} />);
    const container = screen.getByLabelText("Loading content");
    expect(container.children.length).toBe(3);
  });

  it("should have proper ARIA attributes", () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByLabelText("Loading...");
    expect(skeleton).toHaveAttribute("role", "status");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    
    const srOnly = screen.getByText("Loading...", { selector: ".sr-only" });
    expect(srOnly).toBeInTheDocument();
  });
});

describe("ImageSkeleton", () => {
  it("should render with default aspect ratio", () => {
    render(<ImageSkeleton />);
    const skeleton = screen.getByLabelText("Loading image...");
    expect(skeleton.className).toContain("aspect-video");
  });

  it("should render with square aspect ratio", () => {
    render(<ImageSkeleton aspectRatio="square" />);
    const skeleton = screen.getByLabelText("Loading image...");
    expect(skeleton.className).toContain("aspect-square");
  });

  it("should have proper ARIA attributes", () => {
    render(<ImageSkeleton />);
    const skeleton = screen.getByLabelText("Loading image...");
    expect(skeleton).toHaveAttribute("role", "status");
  });
});

describe("CardSkeleton", () => {
  it("should render with image", () => {
    render(<CardSkeleton showImage />);
    const card = screen.getByLabelText("Loading card...");
    expect(card).toBeInTheDocument();
  });

  it("should render without image", () => {
    render(<CardSkeleton showImage={false} />);
    const card = screen.getByLabelText("Loading card...");
    expect(card).toBeInTheDocument();
    // Should have fewer children without image
    expect(card.children.length).toBeLessThan(5);
  });
});

describe("ListSkeleton", () => {
  it("should render default number of items", () => {
    render(<ListSkeleton />);
    const list = screen.getByLabelText("Loading list...");
    expect(list).toBeInTheDocument();
    // 5 items by default
    expect(list.children.length).toBe(5);
  });

  it("should render custom number of items", () => {
    render(<ListSkeleton items={3} />);
    const list = screen.getByLabelText("Loading list...");
    expect(list.children.length).toBe(3);
  });
});

describe("TableSkeleton", () => {
  it("should render default table size", () => {
    render(<TableSkeleton />);
    const table = screen.getByLabelText("Loading table...");
    expect(table).toBeInTheDocument();
  });

  it("should render custom table size", () => {
    render(<TableSkeleton rows={3} cols={2} />);
    const table = screen.getByLabelText("Loading table...");
    expect(table).toBeInTheDocument();
    // Header row + 3 data rows
    expect(table.children.length).toBeGreaterThan(3);
  });
});

