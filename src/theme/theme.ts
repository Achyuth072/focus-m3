"use client";
import { createTheme } from "@mui/material/styles";

const palette = {
  background: "#141218",
  surfaceContainerLow: "#1D1B20",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  primary: "#D0BCFF",
  onPrimary: "#381E72",
  onSurface: "#E6E0E9",
  onSurfaceVariant: "#CAC4D0",
  error: "#F2B8B5",
  onError: "#601410",
};

declare module "@mui/material/styles" {
  interface TypographyVariants {
    displayLarge: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    displayLarge?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    displayLarge: true;
  }
}

// Base theme for breakpoint access
const baseTheme = createTheme();

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.primary,
      contrastText: palette.onPrimary,
    },
    error: {
      main: palette.error,
      contrastText: palette.onError,
    },
    background: {
      default: palette.background,
      paper: palette.surfaceContainer,
    },
    text: {
      primary: palette.onSurface,
      secondary: palette.onSurfaceVariant,
    },
  },
  shape: { borderRadius: 28 }, // Mobile-first default (Expressive)
  typography: {
    fontFamily:
      '"Roboto Flex Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    displayLarge: { fontSize: "57px", fontWeight: 400, lineHeight: 1.12 },
    h1: { fontSize: "57px", fontWeight: 400 },
    h2: { fontSize: "45px", fontWeight: 400 },
    h3: { fontSize: "36px", fontWeight: 400 },
    h4: { fontSize: "28px", fontWeight: 600 },
    h5: { fontSize: "24px", fontWeight: 600 },
    h6: { fontSize: "20px", fontWeight: 600 },
    body1: { fontSize: "16px", fontWeight: 400 },
    body2: { fontSize: "14px", fontWeight: 400 },
    caption: { fontSize: "12px", fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: palette.background } },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28, // Pill shape stays consistent
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 24px",
          // Desktop: Tighter padding for density
          [baseTheme.breakpoints.up("md")]: {
            padding: "8px 20px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: { root: { borderRadius: 28 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28, // Mobile default
          backgroundColor: palette.surfaceContainerLow,
          backgroundImage: "none",
          // Desktop: Tighten radius
          [baseTheme.breakpoints.up("md")]: {
            borderRadius: 16,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Standard M3 Chip
          fontWeight: 500,
        },
        filled: { border: "none" },
        outlined: { borderColor: "rgba(255, 255, 255, 0.12)" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28, // Mobile default
          backgroundImage: "none",
          // Desktop: Tighten radius
          [baseTheme.breakpoints.up("md")]: {
            borderRadius: 16,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    // Desktop density: Tighter list items
    MuiListItem: {
      styleOverrides: {
        root: {
          [baseTheme.breakpoints.up("md")]: {
            paddingTop: 6,
            paddingBottom: 6,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          // Desktop: Tighter padding
          [baseTheme.breakpoints.up("md")]: {
            borderRadius: 12,
            paddingTop: 8,
            paddingBottom: 8,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          // Desktop: Denser table cells
          [baseTheme.breakpoints.up("md")]: {
            padding: "8px 16px",
          },
        },
      },
    },
  },
});

export default theme;
