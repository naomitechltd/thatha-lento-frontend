import React, { useState } from "react";
import { X } from "lucide-react";
import { ProductImage } from "../components/media";
import { Button, inputStyle } from "../components/ui";
import { money } from "../lib/api";

export function ProductDetail({ product, theme, onClose, addToCart, currencySymbol }) {
  const [size, setSize] = useState(product.sizes[0] || "");
  const [color, setColor] = useState(product.colors[0] || "");
  const [qty, setQty] = useState(1);
  const discounted = product.special?.active ? +(product.price * (1 - product.special.percent / 100)).toFixed(2) : null;
  const displayImage = (product.colorImages || {})[color] || product.imageUrl || "";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 16px" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: theme.bg, maxWidth: 640, width: "100%", borderRadius: 4, border: `1px solid ${theme.border}`, padding: 26, color: theme.text }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: theme.text }}><X size={20} /></button>
        </div>
        <ProductImage product={{ ...product, imageUrl: displayImage }} theme={theme} height={220} />
        <div style={{ marginTop: 16, fontSize: 22, fontFamily: "'Iowan Old Style', Georgia, serif" }}>{product.name}</div>
        <div style={{ opacity: 0.7, fontSize: 13.5, marginTop: 6 }}>{product.description}</div>
        <div style={{ marginTop: 12, fontSize: 17 }}>
          {discounted ? (
            <>
              <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 8 }}>{money(currencySymbol, product.price)}</span>
              <span style={{ color: theme.accent, fontWeight: 700 }}>{money(currencySymbol, discounted)}</span>
            </>
          ) : (
            <span>{money(currencySymbol, product.price)}</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Colour</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ padding: "6px 10px", fontSize: 12.5, borderRadius: 3, cursor: "pointer", border: `1px solid ${theme.accent}`, background: color === c ? theme.accent : "transparent", color: color === c ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text }}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Size</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{ padding: "6px 10px", fontSize: 12.5, borderRadius: 3, cursor: "pointer", border: `1px solid ${theme.accent}`, background: size === s ? theme.accent : "transparent", color: size === s ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Qty</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ ...inputStyle(theme), width: 30, padding: "6px 0", cursor: "pointer" }}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={{ ...inputStyle(theme), width: 30, padding: "6px 0", cursor: "pointer" }}>+</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12.5, opacity: 0.8 }}>
          Selected: <strong>Colour — {color || "n/a"}</strong> · <strong>Size — {size || "n/a"}</strong>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>{product.stock} in stock</div>

        <div style={{ marginTop: 20 }}>
          <Button
            theme={theme}
            disabled={product.stock === 0}
            onClick={() => {
              addToCart({ productId: product.id, name: product.name, price: discounted || product.price, size, color, qty });
              onClose();
            }}
          >
            {product.stock === 0 ? "Sold out" : "Add to bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}
