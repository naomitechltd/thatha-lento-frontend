import React from "react";

export function LoadingScreen({ theme, progress, status }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: theme.bg,
        color: theme.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif",
      }}
    >
      <div style={{ fontSize: "clamp(28px, 6vw, 46px)", letterSpacing: "0.18em", fontWeight: 500 }}>THATHA LENTO</div>
      <div style={{ width: 220, height: 2, background: theme.border, marginTop: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, background: theme.accent, transition: "width .2s ease" }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 12, letterSpacing: "0.08em", opacity: 0.6, fontFamily: "system-ui, sans-serif" }}>{status}</div>
    </div>
  );
}
