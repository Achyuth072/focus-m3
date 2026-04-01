**`SidebarProvider`** — the CSS variable for mobile width:

```tsx
// Old (previous attempt — caused the full-screen takeover)
"--sidebar-width-mobile": isMobile && windowWidth <= 360 ? SIDEBAR_WIDTH_SMALL : SIDEBAR_WIDTH_MOBILE,
// where SIDEBAR_WIDTH_SMALL = "100vw"

// New (current)
"--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
// just always 60vw, no special case
```

**`SidebarMenuButton`** — button sizing:

```tsx
// Old
const effectiveSize = isMobile && size === "default" ? "lg" : size;

// New
const effectiveSize =
  isMobile && size === "default" && windowWidth > 360 ? "lg" : size;
```

**`SheetContent` (mobile sidebar shell)** — removed the conditional styling:

```tsx
// Old
className={cn(
  "w-[var(--sidebar-width-mobile)] bg-sidebar p-0 ...",
  windowWidth <= 360 && "px-2 text-sm",  // ← removed
)}
style={{ "--sidebar-width": isMobile && windowWidth <= 360 ? SIDEBAR_WIDTH_SMALL : SIDEBAR_WIDTH_MOBILE }}  // ← removed

// New
className="w-[var(--sidebar-width-mobile)] bg-sidebar p-0 ..."
// no style override
```

**`SidebarMenuSubButton`** — sub-button sizing:

```tsx
// Old
isMobile ? "h-10 text-base" : "h-7",

// New
isMobile && windowWidth > 360 ? "h-10 text-base" : "h-7",
```

The old approach tried to compensate for 360px by making the sidebar bigger (100vw) and then shrinking the text inside it — fighting itself. The new approach simply skips the mobile upsizing on ≤360px devices and leaves the width alone.
