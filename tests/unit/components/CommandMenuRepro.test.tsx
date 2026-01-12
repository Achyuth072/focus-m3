import { render, screen } from "@testing-library/react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { describe, it, expect } from "vitest";

// Mock ResizeObserver and scrollIntoView for cmdk
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.HTMLElement.prototype.scrollIntoView = function () {};
window.HTMLElement.prototype.releasePointerCapture = function () {};
window.HTMLElement.prototype.hasPointerCapture = function () {
  return false;
};

describe("Command Menu Styles", () => {
  it("TC-CMD-01: CommandItem should have correct selection classes for Light Mode", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem data-selected="true" data-testid="cmd-item">
            Test Item
          </CommandItem>
        </CommandList>
      </Command>
    );

    const item = screen.getByTestId("cmd-item");
    const className = item.className;
    console.log("Light Mode ClassName:", className);

    // Check for Light Mode Ink Wash
    expect(className).toContain("data-[selected=true]:bg-foreground/10");
  });

  it("TC-CMD-02: CommandItem should have correct selection classes for Dark Mode", () => {
    render(
      <Command>
        <CommandList>
          <CommandItem data-selected="true" data-testid="cmd-item">
            Test Item
          </CommandItem>
        </CommandList>
      </Command>
    );

    const item = screen.getByTestId("cmd-item");
    const className = item.className;
    console.log("Dark Mode ClassName:", className);

    // Check for Dark Mode Kanso Blue (brand)
    expect(className).toContain("dark:data-[selected=true]:bg-brand/20");
  });
});
