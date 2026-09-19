import React, { useState, useEffect } from "react";
import { inputStyle } from "./ui";
import { NKOMAZI_AREAS } from "../config";

// Stores "Nkomazi: <area>" for the dropdown case, or plain free text for
// anywhere else — parseLocation below reads that same format back in, so
// re-opening an existing address shows the right toggle already selected.
function parseLocation(location) {
  if (location && location.startsWith("Nkomazi: ")) {
    return { type: "nkomazi", area: location.slice("Nkomazi: ".length) };
  }
  return { type: "other", other: location || "" };
}

export function LocationPicker({ theme, value, onChange }) {
  const parsed = parseLocation(value);
  const [type, setType] = useState(parsed.type);
  const [area, setArea] = useState(parsed.area || NKOMAZI_AREAS[0]);
  const [other, setOther] = useState(parsed.type === "other" ? parsed.other : "");

  useEffect(() => {
    onChange(type === "nkomazi" ? `Nkomazi: ${area}` : other);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, area, other]);

  const toggleStyle = (active) => ({
    padding: "8px 14px",
    fontSize: 13,
    borderRadius: 3,
    cursor: "pointer",
    border: `1px solid ${theme.accent}`,
    background: active ? theme.accent : "transparent",
    color: active ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text,
    fontFamily: "inherit",
  });

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, marginBottom: 8, opacity: 0.75 }}>Location (for delivery)</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button type="button" onClick={() => setType("nkomazi")} style={toggleStyle(type === "nkomazi")}>Nkomazi</button>
        <button type="button" onClick={() => setType("other")} style={toggleStyle(type === "other")}>Outside Nkomazi</button>
      </div>
      {type === "nkomazi" ? (
        <select style={inputStyle(theme)} value={area} onChange={(e) => setArea(e.target.value)}>
          {NKOMAZI_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      ) : (
        <input
          style={inputStyle(theme)}
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Nearest town, or complex/mall name"
        />
      )}
    </div>
  );
}
