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
  shape: { borderRadius: 24 },
  typography: {
    fontFamily:
      '"Roboto Flex Variable", "Roboto", "Helvetica", "Arial", sans-serif',
    displayLarge: { fontSize: "57px", fontWeight: 400, lineHeight: 1.12 },
    h1: { fontSize: "57px", fontWeight: 400 },
    h2: { fontSize: "45px", fontWeight: 400 },
    h3: { fontSize: "36px", fontWeight: 400 },
    h4: { fontSize: "28px", fontWeight: 400 },
    h5: { fontSize: "24px", fontWeight: 400 },
    h6: { fontSize: "20px", fontWeight: 500 },
    body1: { fontSize: "16px", fontWeight: 400 },
    body2: { fontSize: "14px", fontWeight: 400 },
    caption: { fontSize: "12px", fontWeight: 500 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: palette.background } },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 24, textTransform: "none" } },
    },
    MuiFab: {
      styleOverrides: { root: { borderRadius: 24 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: palette.surfaceContainerLow,
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 28 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});

export default theme;
