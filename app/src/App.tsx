import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Layout } from "@/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { AssetDetail } from "@/pages/AssetDetail";

const GREEN_PRIMARY = "#4a7c59";

function getTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: { main: GREEN_PRIMARY },
      ...(mode === "light"
        ? {
            background: {
              default: "#e8eae6",
              paper: "#ffffff",
            },
          }
        : {
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === "light" ? "#ffffff" : "#1e1e1e",
            border: "none",
            boxShadow: "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
    },
  });
}

const STORAGE_KEY = "app-theme-mode";

function getInitialMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

function App() {
  const [mode, setMode] = useState<"light" | "dark">(getInitialMode);
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Layout mode={mode} onToggleMode={toggleMode} />}
          >
            <Route index element={<Dashboard />} />
            <Route path="asset/:assetId" element={<AssetDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
