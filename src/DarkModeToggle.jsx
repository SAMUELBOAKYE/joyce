// src/components/DarkModeToggle.jsx
import React, { useEffect, useState } from "react";
import "./dark.css"; // ✅ import the style

const DarkModeToggle = () => {
  const getInitialTheme = () => {
    const stored = localStorage.getItem("theme");
    return stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      className={`toggle ${dark ? "dark" : "light"}`}
      onClick={() => setDark(!dark)}
      title="Toggle Dark Mode"
      aria-label="Toggle Dark Mode"
    >
      <span className="toggle-icon">{dark ? "🌙" : "☀️"}</span>
    </button>
  );
};

export default DarkModeToggle;
