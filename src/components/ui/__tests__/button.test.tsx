import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with primary variant by default", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: /save/i });
    expect(button).toHaveClass("pps-btn", "pps-btn--primary");
  });

  it("respects variant and size props", () => {
    render(
      <Button variant="outline" size="sm">
        Outline
      </Button>
    );

    const button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("pps-btn--outline", "pps-btn--sm");
  });
});

