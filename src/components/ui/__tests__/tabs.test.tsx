import { fireEvent, render, screen } from "@testing-library/react";

import { Tabs, TabsList, TabsPanel, TabsTrigger } from "@/components/ui/tabs";

describe("Tabs", () => {
  function renderTabs() {
    return render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsPanel value="overview">
          <p>Overview content</p>
        </TabsPanel>
        <TabsPanel value="details">
          <p>Details content</p>
        </TabsPanel>
      </Tabs>
    );
  }

  it("activates the default tab", () => {
    renderTabs();

    expect(screen.getByRole("tab", { name: /overview/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/overview content/i)).toBeVisible();
  });

  it("switches tabs on click", () => {
    renderTabs();

    const detailsTab = screen.getByRole("tab", { name: /details/i });
    fireEvent.click(detailsTab);

    expect(detailsTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/details content/i)).toBeVisible();
  });
});

