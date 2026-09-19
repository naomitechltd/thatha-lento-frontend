import React, { useMemo } from "react";
import { ProductCard } from "../components/ProductCard";
import { GENDERS } from "../config";

export function ShopView({ products, theme, view, setView, openProduct, footprint, currencySymbol }) {
  const gender = view.gender || "All";
  const filtered = products.filter((p) => (gender === "All" ? true : p.gender === gender));

  const recommended = useMemo(() => {
    if (!footprint || footprint.length === 0) return [];
    const counts = {};
    footprint.forEach((f) => { counts[f.gender] = (counts[f.gender] || 0) + 1; });
    const topGender = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!topGender) return [];
    return products.filter((p) => p.gender === topGender).slice(0, 4);
  }, [footprint, products]);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 20px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: "clamp(24px,3.4vw,34px)" }}>The collection</div>
        <div style={{ opacity: 0.65, fontSize: 13.5, marginTop: 4 }}>Clothing, cut with intention.</div>
      </div>

      {recommended.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12.5, letterSpacing: "0.04em", opacity: 0.7, marginBottom: 12 }}>Picked for you, based on what you've viewed</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 18 }}>
            {recommended.map((p) => <ProductCard key={p.id} product={p} theme={theme} onOpen={openProduct} currencySymbol={currencySymbol} />)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["All", ...GENDERS].map((g) => (
          <button
            key={g}
            onClick={() => setView({ name: "shop", gender: g })}
            style={{
              background: gender === g ? theme.accent : "transparent",
              color: gender === g ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text,
              border: `1px solid ${theme.accent}`,
              borderRadius: 3,
              padding: "6px 14px",
              fontSize: 12.5,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ opacity: 0.6, padding: "40px 0" }}>Nothing here yet — check back soon.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 22 }}>
          {filtered.map((p) => <ProductCard key={p.id} product={p} theme={theme} onOpen={openProduct} currencySymbol={currencySymbol} />)}
        </div>
      )}
    </div>
  );
}
