import React from "react";
import { AlertCircle } from "lucide-react";

export function Button({ children, onClick, variant = "solid", theme, style, type = "button", disabled }) {
  const base = {
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.01em",
    padding: "10px 18px",
    borderRadius: 3,
    cursor: disabled ? "not-allowed" : "pointer",
    border: `1px solid ${theme.accent}`,
    transition: "opacity .15s ease, transform .1s ease",
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    solid: { background: theme.accent, color: theme.mode === "dark" ? "#232324" : "#FBF9F4" },
    outline: { background: "transparent", color: theme.accent },
    ghost: { background: "transparent", color: theme.text, border: "1px solid transparent" },
    danger: { background: "transparent", color: theme.danger, border: `1px solid ${theme.danger}` },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, marginBottom: 6, opacity: 0.75 }}>{label}</span>
      {children}
    </label>
  );
}

export function inputStyle(theme) {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: 3,
    border: `1px solid ${theme.border}`,
    background: theme.bgSunken,
    color: theme.text,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  };
}

export function Badge({ children, theme, tone = "accent" }) {
  const bg = tone === "accent" ? theme.accent : theme.danger;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 2,
        background: bg,
        color: theme.mode === "dark" ? "#232324" : "#FBF9F4",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

export function ErrorNote({ message, theme }) {
  if (!message) return null;
  return (
    <div style={{ color: theme.danger, fontSize: 12.5, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
      <AlertCircle size={14} /> {message}
    </div>
  );
}
