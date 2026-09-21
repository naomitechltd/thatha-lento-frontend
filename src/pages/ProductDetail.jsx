import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { ProductImage } from "../components/media";
import { Button, inputStyle } from "../components/ui";
import { money, api } from "../lib/api";

function StarRow({ value, onChange, size = 18 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={onChange ? () => onChange(n) : undefined}
          style={{ background: "none", border: "none", padding: 0, cursor: onChange ? "pointer" : "default", lineHeight: 0 }}
        >
          <Star size={size} fill={n <= value ? "#E8B84B" : "none"} color="#E8B84B" />
        </button>
      ))}
    </div>
  );
}

function ProductReviews({ theme, product, myOrders, userToken, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const hasPurchased = (myOrders || []).some((o) =>
    (o.items || []).some((it) => it.productId === product.id)
  );

  useEffect(() => {
    let cancelled = false;
    api(`/reviews/${product.id}`)
      .then((data) => { if (!cancelled) setReviews(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [product.id]);

  const submitReview = async () => {
    setError("");
    if (myRating < 1) { setError("Pick a star rating first."); return; }
    setBusy(true);
    try {
      const saved = await api("/reviews", {
        method: "POST",
        token: userToken,
        body: { productId: product.id, rating: myRating, comment: myComment.trim() },
      });
      setReviews((rs) => [saved, ...rs.filter((r) => r.userName !== saved.userName)]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div style={{ marginTop: 26, borderTop: `1px solid ${theme.border}`, paddingTop: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Reviews</div>

      {!loading && reviews.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <StarRow value={Math.round(average)} />
          <span style={{ fontSize: 12.5, opacity: 0.7 }}>{average.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
        </div>
      )}
      {!loading && reviews.length === 0 && (
        <div style={{ fontSize: 12.5, opacity: 0.6, marginBottom: 16 }}>No reviews yet.</div>
      )}

      {currentUser && hasPurchased && (
        <div style={{ marginBottom: 20, border: `1px solid ${theme.border}`, borderRadius: 4, padding: 14 }}>
          <div style={{ fontSize: 12.5, opacity: 0.7, marginBottom: 8 }}>Leave a review</div>
          <StarRow value={myRating} onChange={setMyRating} size={22} />
          <textarea
            rows={3}
            placeholder="What did you think? (optional)"
            style={{ ...inputStyle(theme), resize: "vertical", marginTop: 10 }}
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
          />
          {error && <div style={{ color: theme.danger, fontSize: 12, marginTop: 6 }}>{error}</div>}
          <div style={{ marginTop: 10 }}>
            <Button theme={theme} onClick={submitReview} disabled={busy}>{busy ? "Saving..." : "Submit review"}</Button>
            {saved && <span style={{ color: theme.accent, fontSize: 12.5, marginLeft: 10 }}>Saved.</span>}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {reviews.map((r) => (
          <div key={r.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarRow value={r.rating} size={14} />
              <span style={{ fontSize: 12, opacity: 0.6 }}>{r.userName || "Customer"}</span>
            </div>
            {r.comment && <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>{r.comment}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductDetail({ product, theme, onClose, addToCart, currencySymbol, myOrders, userToken, currentUser }) {
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
        <ProductImage product={{ ...product, imageUrl: displayImage }} theme={theme} height={420} fit="contain" />
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

        <ProductReviews theme={theme} product={product} myOrders={myOrders} userToken={userToken} currentUser={currentUser} />
      </div>
    </div>
  );
}
