import React, { useState, useMemo } from "react";
import { uploadImageFile } from "../lib/api";
import { inputStyle } from "./ui";

export function ProductImage({ product, theme, height = 260 }) {
  const [failed, setFailed] = useState(false);
  if (product.imageUrl && !failed) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        onError={() => setFailed(true)}
        style={{ height, width: "100%", objectFit: "cover", border: `1px solid ${theme.border}`, display: "block" }}
      />
    );
  }
  return (
    <div style={{ height, background: theme.bgSunken, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textDim, fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 13, letterSpacing: "0.06em", border: `1px solid ${theme.border}`, textAlign: "center", padding: 12 }}>
      {product.name}
    </div>
  );
}

// Lets an admin pick a photo straight from their device. Uploads it to
// Cloudinary and calls onChange with the resulting URL. Also offers a
// "paste a link instead" fallback for photos already hosted elsewhere.
export function PhotoPicker({ theme, value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const inputId = useMemo(() => "photo-" + Math.random().toString(36).slice(2), []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontSize: 12.5, marginBottom: 6, opacity: 0.75 }}>{label}</div>}
      {value && (
        <div style={{ marginBottom: 8 }}>
          <ProductImage product={{ name: label || "Photo", imageUrl: value }} theme={theme} height={140} />
        </div>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <label
          htmlFor={inputId}
          style={{
            display: "inline-block",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 3,
            border: `1px solid ${theme.accent}`,
            color: theme.accent,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading..." : value ? "Change photo" : "Choose photo"}
        </label>
        <input id={inputId} type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer", fontSize: 12.5 }}
          >
            Remove
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          style={{ background: "none", border: "none", color: theme.textDim, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}
        >
          {showUrlInput ? "hide link field" : "or paste a link instead"}
        </button>
      </div>
      {showUrlInput && (
        <input
          style={{ ...inputStyle(theme), marginTop: 8 }}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}
      {error && <div style={{ color: theme.danger, fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
