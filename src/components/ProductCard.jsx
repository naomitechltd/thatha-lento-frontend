import React from "react";
import { ProductImage } from "./media";
import { money } from "../lib/api";

export function ProductCard({ product, theme, onOpen, currencySymbol }) {
  const discounted = product.special?.active
    ? +(product.price * (1 - product.special.percent / 100)).toFixed(2)
    : null;

  return (
    <button
      onClick={() => onOpen(product)}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        color: theme.text,
        display: "block",
        width: "100%",
      }}
    >
      <ProductImage product={product} theme={theme} height={220} />

      <div style={{ paddingTop: 10 }}>
        <div
          style={{
            fontFamily: "'Iowan Old Style', Georgia, serif",
            fontSize: 14.5,
            lineHeight: 1.35,
            marginBottom: 4,
          }}
        >
          {product.name}
        </div>

        <div style={{ fontSize: 13.5 }}>
          {discounted ? (
            <>
              <span
                style={{
                  textDecoration: "line-through",
                  opacity: 0.5,
                  marginRight: 6,
                }}
              >
                {money(currencySymbol, product.price)}
              </span>
              <span style={{ color: theme.accent, fontWeight: 700 }}>
                {money(currencySymbol, discounted)}
              </span>
            </>
          ) : (
            <span>{money(currencySymbol, product.price)}</span>
          )}
        </div>

        {product.stock === 0 && (
          <div
            style={{
              fontSize: 11.5,
              color: theme.danger,
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            Sold out
          </div>
        )}
      </div>
    </button>
  );
}
