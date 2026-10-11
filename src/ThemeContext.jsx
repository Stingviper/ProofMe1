import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeContext = createContext(null);

function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme === "light" ? "light" : "dark";
  document.body.style.background = theme === "light" ? "#f3f0fa" : "#08080d";
  document.body.style.color = theme === "light" ? "#1a1523" : "#ececf1";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("proofme-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem("proofme-theme", theme);
    } catch {}
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark",
      isDark: true,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}

/**
 * Icon-only theme toggle button. Renders a sun icon in dark mode
 * (click to go light) and a moon icon in light mode.
 */
export function ThemeToggle({ className = "", size = 18, ariaLabel }) {
  const { isDark, toggleTheme } = useTheme();
  const label =
    ariaLabel || (isDark ? "Switch to light mode" : "Switch to dark mode");
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}