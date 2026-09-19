import { useState, useEffect, useMemo } from "react";

export function useTheme() {
  const [mode, setMode] = useState("dark");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
    setReady(true);
  }, []);
  const theme = useMemo(() => {
    return mode === "dark"
      ? {
          mode: "dark",
          bg: "#232324",
          bgElevated: "#2b2b2d",
          bgSunken: "#1c1c1d",
          text: "#F3EFE4",
          textDim: "#B9B4A6",
          accent: "#E3C567",
          border: "rgba(227,197,103,0.22)",
          danger: "#E28B7D",
        }
      : {
          mode: "light",
          bg: "#FBF9F4",
          bgElevated: "#FFFFFF",
          bgSunken: "#F1EEE4",
          text: "#211D14",
          textDim: "#6E6656",
          accent: "#A5750F",
          border: "rgba(165,117,15,0.28)",
          danger: "#B23A2E",
        };
  }, [mode]);
  return { mode, setMode, theme, ready };
}
