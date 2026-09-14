import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingBag, Sun, Moon, Menu, X, Plus, Trash2, Bug, Package, Tag, User, LogOut, Check, AlertCircle } from "lucide-react";

/* ---------------------------------------------------------
   THATHA LENTO — frontend
   Talks to the backend API (see ../thatha-lento-backend).
   Set VITE_API_URL in .env to point at it.
--------------------------------------------------------- */

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const WHATSAPP_NUMBER = "+27 72 998 9988"; // placeholder — update with the real number
// Photo uploads go straight from the browser to Cloudinary's free tier (no
// backend storage needed). Sign up at cloudinary.com, create an "unsigned"
// upload preset, then set these two in your .env / Vercel env vars.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

async function uploadImageFile(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Photo upload isn't set up yet — ask your developer to configure Cloudinary.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Photo upload failed.");
  return data.secure_url;
}
const PAY_DETAILS = {
  bank: "Thatha Lento Ltd.",
  account: "0000-0000-0000",
  bankName: "Placeholder Bank",
  swift: "PLCHXXXX",
};
const GENDERS = ["Male", "Female"];

// Formats an amount with the store's currency symbol (fetched from
// /settings, admin-editable — see AdminDashboard's "Store" tab).
function money(symbol, amount) {
  return `${symbol}${Number(amount).toFixed(2)}`;
}

/* ---------------- API helper ----------------
   Centralises fetch + auth header + error surfacing so every
   call site gets consistent behaviour. Throws a plain Error
   with the server's message on non-2xx responses. */
async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/* ---------------- persisted session tokens ----------------
   Tokens live in localStorage so a refresh doesn't log people
   out. For stronger protection against XSS, a future version
   could have the backend set these as httpOnly cookies instead
   — the frontend calls would stay nearly identical. */
function useStoredToken(key) {
  const [token, setTokenState] = useState(() => localStorage.getItem(key) || null);
  const setToken = (t) => {
    setTokenState(t);
    if (t) localStorage.setItem(key, t);
    else localStorage.removeItem(key);
  };
  return [token, setToken];
}

// Alongside the token, we keep the small bit of profile info (name/email or
// email/role) that the login response gave us, so a page refresh can restore
// "who's logged in" without needing a dedicated whoami endpoint.
function useStoredJSON(key) {
  const [value, setValueState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const setValue = (v) => {
    setValueState(v);
    if (v) localStorage.setItem(key, JSON.stringify(v));
    else localStorage.removeItem(key);
  };
  return [value, setValue];
}

/* ---------------- theming ---------------- */
function useTheme() {
  const [mode, setMode] = useState("dark");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
    setReady(true);
  }, []);
  const theme = useMemo(() => {
    return mode === "dark"
      ? {
          mode: "dark",
          bg: "#232324",
          bgElevated: "#2b2b2d",
          bgSunken: "#1c1c1d",
          text: "#F3EFE4",
          textDim: "#B9B4A6",
          accent: "#E3C567",
          border: "rgba(227,197,103,0.22)",
          danger: "#E28B7D",
        }
      : {
          mode: "light",
          bg: "#FBF9F4",
          bgElevated: "#FFFFFF",
          bgSunken: "#F1EEE4",
          text: "#211D14",
          textDim: "#6E6656",
          accent: "#A5750F",
          border: "rgba(165,117,15,0.28)",
          danger: "#B23A2E",
        };
  }, [mode]);
  return { mode, setMode, theme, ready };
}

/* ---------------- small UI atoms ---------------- */
function Button({ children, onClick, variant = "solid", theme, style, type = "button", disabled }) {
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

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 12.5, marginBottom: 6, opacity: 0.75 }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(theme) {
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

function Badge({ children, theme, tone = "accent" }) {
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

function ErrorNote({ message, theme }) {
  if (!message) return null;
  return (
    <div style={{ color: theme.danger, fontSize: 12.5, marginBottom: 12, display: "flex", gap: 6, alignItems: "center" }}>
      <AlertCircle size={14} /> {message}
    </div>
  );
}

/* ---------------- Loading screen ---------------- */
function LoadingScreen({ theme, progress, status }) {
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

/* ---------------- Nav bar ---------------- */
function NavBar({ theme, mode, setMode, view, setView, cartCount, currentUser, currentAdmin, onLogout, mobileOpen, setMobileOpen }) {
  const linkStyle = (active) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13.5,
    letterSpacing: "0.03em",
    color: active ? theme.accent : theme.text,
    padding: "8px 4px",
    borderBottom: active ? `2px solid ${theme.accent}` : "2px solid transparent",
  });
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <button
          onClick={() => setView({ name: "about" })}
          style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif", fontSize: 20, letterSpacing: "0.12em", color: theme.text, padding: 0 }}
          title="About Thatha Lento"
        >
          THATHA <span style={{ color: theme.accent }}>LENTO</span>
        </button>

        <div className="tl-desktop-nav" style={{ display: "flex", gap: 22, alignItems: "center" }}>
          <button style={linkStyle(view.name === "shop")} onClick={() => setView({ name: "shop", gender: "All" })}>Shop</button>
          <button style={linkStyle(view.name === "about")} onClick={() => setView({ name: "about" })}>About</button>
          {currentAdmin ? (
            <button style={linkStyle(view.name === "admin")} onClick={() => setView({ name: "admin" })}>Admin</button>
          ) : (
            <button style={linkStyle(view.name === "admin-login")} onClick={() => setView({ name: "admin-login" })}>Admin</button>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} title="Toggle theme" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex" }}>
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {!currentAdmin && (
            <button onClick={() => setView({ name: "cart" })} title="Cart" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, position: "relative", display: "flex" }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: -7, right: -9, background: theme.accent, color: theme.mode === "dark" ? "#232324" : "#FBF9F4", fontSize: 10, fontWeight: 700, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {!currentAdmin && (
            <button onClick={() => setView(currentUser ? { name: "account" } : { name: "login" })} title={currentUser ? "Account" : "Log in"} style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex" }}>
              <User size={18} />
            </button>
          )}

          {currentAdmin && (
            <button onClick={onLogout} title="Log out" style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, display: "flex" }}>
              <LogOut size={18} />
            </button>
          )}

          <button className="tl-mobile-toggle" onClick={() => setMobileOpen((v) => !v)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: theme.text }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ borderTop: `1px solid ${theme.border}`, padding: "10px 20px 16px", display: "flex", flexDirection: "column", gap: 10, background: theme.bg }}>
          <button style={linkStyle(view.name === "shop")} onClick={() => { setView({ name: "shop", gender: "All" }); setMobileOpen(false); }}>Shop</button>
          <button style={linkStyle(view.name === "about")} onClick={() => { setView({ name: "about" }); setMobileOpen(false); }}>About</button>
          {currentAdmin ? (
            <button style={linkStyle(view.name === "admin")} onClick={() => { setView({ name: "admin" }); setMobileOpen(false); }}>Admin</button>
          ) : (
            <button style={linkStyle(view.name === "admin-login")} onClick={() => { setView({ name: "admin-login" }); setMobileOpen(false); }}>Admin login</button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .tl-desktop-nav { display: none !important; }
          .tl-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Product card & placeholder swatch ---------------- */
function ProductImage({ product, theme, height = 260 }) {
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
function PhotoPicker({ theme, value, onChange, label }) {
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

function ProductCard({ product, theme, onOpen, currencySymbol }) {
  const discounted = product.special?.active ? +(product.price * (1 - product.special.percent / 100)).toFixed(2) : null;
  const fallbackImage = product.imageUrl || Object.values(product.colorImages || {})[0] || "";
  return (
    <div onClick={() => onOpen(product)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ position: "relative" }}>
        <ProductImage product={{ ...product, imageUrl: fallbackImage }} theme={theme} />
        {product.special?.active && (
          <div style={{ position: "absolute", top: 8, left: 8 }}>
            <Badge theme={theme} tone="danger">-{product.special.percent}%</Badge>
          </div>
        )}
        {product.stock === 0 && (
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <Badge theme={theme}>Sold out</Badge>
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{product.name}</div>
        <div style={{ fontSize: 12.5, opacity: 0.6, marginTop: 2 }}>{product.gender}</div>
        <div style={{ marginTop: 4, fontSize: 14 }}>
          {discounted ? (
            <>
              <span style={{ textDecoration: "line-through", opacity: 0.5, marginRight: 8 }}>{money(currencySymbol, product.price)}</span>
              <span style={{ color: theme.accent, fontWeight: 700 }}>{money(currencySymbol, discounted)}</span>
            </>
          ) : (
            <span>{money(currencySymbol, product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shop view ---------------- */
function ShopView({ products, theme, view, setView, openProduct, footprint, currencySymbol }) {
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

/* ---------------- Product detail ---------------- */
function ProductDetail({ product, theme, onClose, addToCart, currencySymbol }) {
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
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Size</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{ padding: "6px 10px", fontSize: 12.5, borderRadius: 3, cursor: "pointer", border: `1px solid ${theme.accent}`, background: size === s ? theme.accent : "transparent", color: size === s ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Colour</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {product.colors.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ padding: "6px 10px", fontSize: 12.5, borderRadius: 3, cursor: "pointer", border: `1px solid ${theme.accent}`, background: color === c ? theme.accent : "transparent", color: color === c ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text }}>{c}</button>
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

        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>{product.stock} in stock</div>

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

/* ---------------- Cart view ---------------- */
function CartView({ cart, theme, setView, removeFromCart, currentUser, currencySymbol }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 26, marginBottom: 20 }}>Your bag</div>
      {cart.length === 0 ? (
        <div style={{ opacity: 0.65 }}>
          Your bag is empty.{" "}
          <button onClick={() => setView({ name: "shop", gender: "All" })} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontFamily: "inherit" }}>Continue shopping</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${theme.border}`, paddingBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{item.name}</div>
                  <div style={{ fontSize: 12.5, opacity: 0.65 }}>{item.color} · {item.size} · qty {item.qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div>{money(currencySymbol, item.price * item.qty)}</div>
                  <button onClick={() => removeFromCart(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.danger }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 16, fontWeight: 700 }}>
            <span>Total</span><span>{money(currencySymbol, total)}</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <Button theme={theme} onClick={() => setView({ name: currentUser ? "checkout" : "login", redirectTo: "checkout" })}>Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Auth views ---------------- */
function LoginView({ theme, setView, onLogin, redirectTo }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !password) { setError("Enter your email and password."); return; }
    if (mode === "signup" && (!name || !phone || !location)) {
      setError("Name, phone number and location are all required.");
      return;
    }
    setBusy(true);
    try {
      await onLogin({ mode, email, password, name, phone, location });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", padding: "60px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 6 }}>{mode === "login" ? "Log in" : "Create an account"}</div>
      <div style={{ opacity: 0.65, fontSize: 13, marginBottom: 22 }}>{redirectTo === "checkout" ? "Sign in to complete your checkout." : "Access your orders and saved details."}</div>

      {mode === "signup" && (
        <>
          <Field label="Name"><input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Cell phone number"><input type="tel" style={inputStyle(theme)} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 082 123 4567" /></Field>
          <Field label="Location (for delivery)"><input style={inputStyle(theme)} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb, city" /></Field>
        </>
      )}
      <Field label="Email"><input type="email" style={inputStyle(theme)} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Password"><input type="password" style={inputStyle(theme)} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>

      <ErrorNote message={error} theme={theme} />

      <Button theme={theme} onClick={submit} disabled={busy} style={{ width: "100%" }}>
        {busy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </Button>

      <div style={{ marginTop: 16, fontSize: 12.5, opacity: 0.7 }}>
        {mode === "login" ? (
          <>New here? <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontFamily: "inherit" }}>Create an account</button></>
        ) : (
          <>Already have an account? <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontFamily: "inherit" }}>Log in</button></>
        )}
      </div>
    </div>
  );
}

const TERMS_OF_USE_TEXT = `By placing an order you agree that: the details you provide (name, phone number, delivery location) will be used solely to fulfil and deliver your order; payment is made via manual bank transfer, confirmed once you send proof of payment via WhatsApp; orders are only prepared once payment is confirmed; and delivery timeframes may vary. This is a placeholder Terms of Use — replace it with your actual store policy.`;

/* ---------------- Checkout / payment placeholder ---------------- */
function CheckoutView({ theme, cart, placeOrder, setView, currencySymbol, currentUser, updateProfile }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // snapshot of the real order, so its total survives the cart being cleared
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [editingDelivery, setEditingDelivery] = useState(!currentUser?.phone || !currentUser?.location);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Use the server-confirmed order total once placed (cart is cleared right
  // after placing, so recalculating from `cart` here would show $0.00).
  const waTotal = placedOrder ? placedOrder.total : total;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Thatha Lento, here is my proof of payment for order total " + money(currencySymbol, waTotal))}`;

  if (cart.length === 0 && !placed) {
    return <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px" }}><div style={{ opacity: 0.7 }}>Your bag is empty.</div></div>;
  }

  const confirm = async () => {
    setError("");
    if (!phone.trim() || !location.trim()) { setError("A phone number and location are required for delivery."); return; }
    if (!termsAccepted) { setError("Please agree to the Terms of Use to continue."); return; }
    setBusy(true);
    try {
      // Persist any changes to their saved delivery details for next time.
      if (phone.trim() !== (currentUser?.phone || "") || location.trim() !== (currentUser?.location || "")) {
        await updateProfile(phone.trim(), location.trim());
      }
      const order = await placeOrder({ phone: phone.trim(), location: location.trim() });
      setPlacedOrder(order);
      setPlaced(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 20 }}>Checkout</div>

      {!placed ? (
        <>
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Order summary</div>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                <span>{item.name} ({item.color}, {item.size}) × {item.qty}</span>
                <span>{money(currencySymbol, item.price * item.qty)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 10, borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
              <span>Total</span><span>{money(currencySymbol, total)}</span>
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
              Final total is re-checked by the server at checkout.
            </div>
          </div>

          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 18, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Deliver to</div>
              {!editingDelivery && (
                <button onClick={() => setEditingDelivery(true)} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit" }}>
                  Edit
                </button>
              )}
            </div>
            {editingDelivery ? (
              <>
                <Field label="Cell phone number"><input type="tel" style={inputStyle(theme)} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 082 123 4567" /></Field>
                <Field label="Location"><input style={inputStyle(theme)} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Suburb, city" /></Field>
                {currentUser?.phone && currentUser?.location && (
                  <button onClick={() => setEditingDelivery(false)} style={{ background: "none", border: "none", color: theme.textDim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", textDecoration: "underline" }}>
                    cancel
                  </button>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                <div>{currentUser?.name}</div>
                <div>{phone}</div>
                <div>{location}</div>
                <div style={{ fontSize: 11.5, opacity: 0.55, marginTop: 4 }}>Still your current location? If not, tap Edit above.</div>
              </div>
            )}
          </div>

          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Payment details</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.9 }}>
              <div>Account name: {PAY_DETAILS.bank}</div>
              <div>Account number: {PAY_DETAILS.account}</div>
              <div>Bank: {PAY_DETAILS.bankName}</div>
              <div>SWIFT/BIC: {PAY_DETAILS.swift}</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 10 }}>
              Transfer the total above, then send us a screenshot as proof of payment via WhatsApp.
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} style={{ marginTop: 2 }} />
              <span>
                I agree to the{" "}
                <button type="button" onClick={() => setShowTerms((v) => !v)} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0, textDecoration: "underline" }}>
                  Terms of Use
                </button>
              </span>
            </label>
            {showTerms && (
              <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.7, opacity: 0.75, border: `1px solid ${theme.border}`, borderRadius: 4, padding: 12 }}>
                {TERMS_OF_USE_TEXT}
              </div>
            )}
          </div>

          <ErrorNote message={error} theme={theme} />

          <Button theme={theme} onClick={confirm} disabled={busy}>{busy ? "Placing order..." : "Confirm order"}</Button>
        </>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.accent, marginBottom: 14 }}>
            <Check size={18} /> Order placed
          </div>
          <div style={{ fontSize: 13.5, opacity: 0.75, marginBottom: 18 }}>
            Send your payment screenshot on WhatsApp so we can confirm and start preparing your order.
          </div>
          <a href={waLink} target="_blank" rel="noopener noreferrer">
            <Button theme={theme}>Send proof of payment on WhatsApp</Button>
          </a>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setView({ name: "shop", gender: "All" })} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontFamily: "inherit" }}>Continue shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Account view (orders + bug report) ---------------- */
function AccountView({ theme, currentUser, myOrders, submitBug, onLogout, currencySymbol, updateProfile }) {
  const [bugText, setBugText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const [editingDelivery, setEditingDelivery] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [deliveryError, setDeliveryError] = useState("");
  const [deliverySaved, setDeliverySaved] = useState(false);

  const saveDelivery = async () => {
    setDeliveryError("");
    if (!phone.trim() || !location.trim()) { setDeliveryError("Phone number and location are both required."); return; }
    try {
      await updateProfile(phone.trim(), location.trim());
      setEditingDelivery(false);
      setDeliverySaved(true);
      setTimeout(() => setDeliverySaved(false), 2000);
    } catch (e) {
      setDeliveryError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 4 }}>{currentUser.name}</div>
      <div style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>{currentUser.email}</div>

      <div style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Delivery details</div>
          {!editingDelivery && (
            <button onClick={() => setEditingDelivery(true)} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit" }}>Edit</button>
          )}
        </div>
        {editingDelivery ? (
          <>
            <Field label="Cell phone number"><input type="tel" style={inputStyle(theme)} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Location"><input style={inputStyle(theme)} value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <ErrorNote message={deliveryError} theme={theme} />
            <div style={{ display: "flex", gap: 10 }}>
              <Button theme={theme} onClick={saveDelivery}>Save</Button>
              <Button variant="ghost" theme={theme} onClick={() => { setEditingDelivery(false); setPhone(currentUser.phone || ""); setLocation(currentUser.location || ""); }}>Cancel</Button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            <div>{currentUser.phone || "No phone number saved"}</div>
            <div>{currentUser.location || "No location saved"}</div>
          </div>
        )}
        {deliverySaved && <div style={{ color: theme.accent, fontSize: 12.5, marginTop: 8 }}>Saved.</div>}
      </div>

      <div style={{ marginBottom: 30 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Order history</div>
        {myOrders.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: 13.5 }}>No orders yet.</div>
        ) : (
          myOrders.map((o) => (
            <div key={o.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 12, marginBottom: 8, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{new Date(o.created_at).toLocaleDateString()}</span>
                <span>{money(currencySymbol, o.total)}</span>
              </div>
              <div style={{ opacity: 0.65, marginTop: 4 }}>{o.items.length} item(s) · {o.status}</div>
              <div style={{ opacity: 0.55, marginTop: 2, fontSize: 12 }}>Delivered to: {o.location} · {o.phone}</div>
            </div>
          ))
        )}
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Report a bug</div>
        {sent ? (
          <div style={{ color: theme.accent, fontSize: 13.5 }}>Thanks — your report was sent to our team.</div>
        ) : (
          <>
            <textarea value={bugText} onChange={(e) => setBugText(e.target.value)} placeholder="Tell us what went wrong..." rows={4} style={{ ...inputStyle(theme), resize: "vertical", marginBottom: 10 }} />
            <ErrorNote message={error} theme={theme} />
            <Button
              theme={theme}
              disabled={!bugText.trim()}
              onClick={async () => {
                try {
                  await submitBug(bugText.trim());
                  setBugText("");
                  setSent(true);
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Send report
            </Button>
          </>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <Button variant="outline" theme={theme} onClick={onLogout}>Log out</Button>
      </div>
    </div>
  );
}

/* ---------------- About view ---------------- */
function AboutView({ theme }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 30, marginBottom: 18 }}>About Thatha Lento</div>
      <p style={{ lineHeight: 1.8, opacity: 0.85, fontSize: 14.5 }}>
        Thatha Lento makes clothing meant to last longer than a season. Every
        piece is chosen for how it wears, not just how it photographs — natural
        fabrics, considered tailoring, and a small, changing collection instead
        of an endless one.
      </p>
      <p style={{ lineHeight: 1.8, opacity: 0.85, fontSize: 14.5, marginTop: 14 }}>
        We're a small team, and every order is packed and checked by hand.
        If something isn't right, our WhatsApp line is always open.
      </p>
    </div>
  );
}

/* ---------------- Admin login ---------------- */
function AdminLoginView({ theme, onAdminLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email || !code) { setError("Enter your email and admin code."); return; }
    setBusy(true);
    try {
      await onAdminLogin(email, code);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", padding: "60px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 6 }}>Administrator</div>
      <div style={{ opacity: 0.65, fontSize: 13, marginBottom: 22 }}>Sign in with your email and access code.</div>
      <Field label="Email"><input type="email" style={inputStyle(theme)} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label="Access code"><input type="password" style={inputStyle(theme)} value={code} onChange={(e) => setCode(e.target.value)} /></Field>
      <ErrorNote message={error} theme={theme} />
      <Button theme={theme} onClick={submit} disabled={busy} style={{ width: "100%" }}>{busy ? "Checking..." : "Sign in"}</Button>
    </div>
  );
}

/* ---------------- Admin dashboard ---------------- */
function AdminDashboard({ theme, currentAdmin, products, orders, bugReports, addProduct, updateProduct, deleteProduct, updateOrderStatus, currencySymbol, updateCurrency }) {
  const [tab, setTab] = useState(currentAdmin.role === "bugs" ? "bugs" : "products");
  const isFull = currentAdmin.role === "full";

  const tabs = isFull
    ? [
        { key: "products", label: "Products", icon: Package },
        { key: "add", label: "Add item", icon: Plus },
        { key: "specials", label: "Specials", icon: Tag },
        { key: "orders", label: "Orders", icon: ShoppingBag },
        { key: "bugs", label: "Bug reports", icon: Bug },
        { key: "store", label: "Store", icon: Tag },
      ]
    : [{ key: "bugs", label: "Bug reports", icon: Bug }];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 4 }}>Administrator</div>
      <div style={{ opacity: 0.6, fontSize: 13, marginBottom: 24 }}>Signed in as {currentAdmin.email} · {isFull ? "full access" : "bug reports only"}</div>

      <div style={{ display: "flex", gap: 8, marginBottom: 26, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", alignItems: "center", gap: 6, background: tab === t.key ? theme.accent : "transparent", color: tab === t.key ? (theme.mode === "dark" ? "#232324" : "#FBF9F4") : theme.text, border: `1px solid ${theme.accent}`, borderRadius: 3, padding: "7px 12px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.length === 0 && <div style={{ opacity: 0.6 }}>No products yet.</div>}
          {products.map((p) => (
            <div key={p.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 14, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div style={{ flex: "1 1 260px" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12.5, opacity: 0.65 }}>{p.gender} · {money(currencySymbol, p.price)} · stock {p.stock} · sizes {p.sizes.join(", ")} · colours {p.colors.join(", ")}</div>
                {p.createdBy && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>added by {p.createdBy}</div>}
                <div style={{ marginTop: 8, maxWidth: 260 }}>
                  <PhotoPicker
                    theme={theme}
                    label="Main photo"
                    value={p.imageUrl || ""}
                    onChange={(url) => updateProduct(p.id, { imageUrl: url })}
                  />
                </div>
                {p.colors.length > 0 && (
                  <div style={{ marginTop: 4, maxWidth: 260 }}>
                    <div style={{ fontSize: 11.5, opacity: 0.6, marginBottom: 4 }}>Photo per colour (optional)</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {p.colors.map((c) => (
                        <PhotoPicker
                          key={c}
                          theme={theme}
                          label={c}
                          value={(p.colorImages || {})[c] || ""}
                          onChange={(url) => updateProduct(p.id, { colorImages: { ...(p.colorImages || {}), [c]: url } })}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  Stock
                  <input type="number" min={0} defaultValue={p.stock} onBlur={(e) => updateProduct(p.id, { stock: Math.max(0, parseInt(e.target.value) || 0) })} style={{ ...inputStyle(theme), width: 64, padding: "5px 8px" }} />
                </label>
                <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  Price
                  <input type="number" min={0} defaultValue={p.price} onBlur={(e) => updateProduct(p.id, { price: Math.max(0, parseFloat(e.target.value) || 0) })} style={{ ...inputStyle(theme), width: 74, padding: "5px 8px" }} />
                </label>
                <button onClick={() => deleteProduct(p.id)} style={{ background: "none", border: "none", color: theme.danger, cursor: "pointer" }} title="Delete item"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "add" && <AddProductForm theme={theme} onAdd={addProduct} />}

      {tab === "specials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name} <span style={{ fontWeight: 400, opacity: 0.6 }}>({money(currencySymbol, p.price)})</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                  <input type="checkbox" defaultChecked={p.special?.active || false} onChange={(e) => updateProduct(p.id, { special: { active: e.target.checked, percent: p.special?.percent || 0 } })} />
                  Active
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                  Discount %
                  <input type="number" min={0} max={90} defaultValue={p.special?.percent || 0} onBlur={(e) => updateProduct(p.id, { special: { active: p.special?.active || false, percent: Math.min(90, Math.max(0, parseInt(e.target.value) || 0)) } })} style={{ ...inputStyle(theme), width: 64, padding: "5px 8px" }} />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.length === 0 && <div style={{ opacity: 0.6 }}>No orders yet.</div>}
          {orders.map((o) => (
            <div key={o.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, flexWrap: "wrap", gap: 8 }}>
                <span>{o.user_email}</span>
                <span>{new Date(o.created_at).toLocaleString()}</span>
                <span>{money(currencySymbol, o.total)}</span>
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 6 }}>
                {o.items.map((it, i) => <div key={i}>{it.name} ({it.color}, {it.size}) × {it.qty}</div>)}
              </div>
              <div style={{ marginTop: 8 }}>
                <select defaultValue={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} style={{ ...inputStyle(theme), width: "auto", padding: "5px 8px", fontSize: 12.5 }}>
                  <option value="pending payment">Pending payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bugs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {bugReports.length === 0 && <div style={{ opacity: 0.6 }}>No bug reports yet.</div>}
          {bugReports.map((b) => (
            <div key={b.id} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, opacity: 0.7 }}>
                <span>{b.user_email}</span>
                <span>{new Date(b.created_at).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 13.5, marginTop: 6 }}>{b.message}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "store" && (
        <StoreSettingsForm theme={theme} currencySymbol={currencySymbol} updateCurrency={updateCurrency} />
      )}
    </div>
  );
}

function StoreSettingsForm({ theme, currencySymbol, updateCurrency }) {
  const [value, setValue] = useState(currencySymbol);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      await updateCurrency(value.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 360 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Currency</div>
      <Field label="Currency symbol shown on every price (e.g. $, £, ₦, KES )">
        <input style={inputStyle(theme)} value={value} onChange={(e) => setValue(e.target.value)} maxLength={6} />
      </Field>
      <ErrorNote message={error} theme={theme} />
      <Button theme={theme} onClick={submit}>Save</Button>
      {saved && <div style={{ color: theme.accent, fontSize: 12.5, marginTop: 10 }}>Saved — prices will show the new symbol.</div>}
    </div>
  );
}

function AddProductForm({ theme, onAdd }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [colors, setColors] = useState("");
  const [sizes, setSizes] = useState("");
  const [gender, setGender] = useState(GENDERS[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [colorImages, setColorImages] = useState({}); // { colorName: url }
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const colorList = colors.split(",").map((c) => c.trim()).filter(Boolean);

  const submit = async () => {
    setError("");
    if (!name || !price) return;
    try {
      // Only keep color-image entries for colors still in the list, and drop empties.
      const cleanedColorImages = {};
      colorList.forEach((c) => {
        if (colorImages[c]) cleanedColorImages[c] = colorImages[c];
      });
      await onAdd({
        name,
        description,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 0,
        colors: colorList,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        gender,
        imageUrl,
        colorImages: cleanedColorImages,
      });
      setName(""); setDescription(""); setPrice(""); setStock(""); setColors(""); setSizes(""); setImageUrl(""); setColorImages({});
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <Field label="Name"><input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Description"><textarea rows={3} style={{ ...inputStyle(theme), resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Price"><input type="number" style={inputStyle(theme)} value={price} onChange={(e) => setPrice(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Number of items (stock)"><input type="number" style={inputStyle(theme)} value={stock} onChange={(e) => setStock(e.target.value)} /></Field></div>
      </div>
      <Field label="Colours (comma separated)"><input style={inputStyle(theme)} value={colors} onChange={(e) => setColors(e.target.value)} placeholder="Black, Camel" /></Field>
      <Field label="Sizes (comma separated)"><input style={inputStyle(theme)} value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L" /></Field>
      <Field label="Gender">
        <select style={inputStyle(theme)} value={gender} onChange={(e) => setGender(e.target.value)}>
          {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </Field>
      <PhotoPicker theme={theme} label="Main photo" value={imageUrl} onChange={setImageUrl} />

      {colorList.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, marginBottom: 8, opacity: 0.75 }}>Photo per colour (optional — falls back to the main photo above if left blank)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {colorList.map((c) => (
              <PhotoPicker
                key={c}
                theme={theme}
                label={c}
                value={colorImages[c] || ""}
                onChange={(url) => setColorImages((prev) => ({ ...prev, [c]: url }))}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11.5, opacity: 0.55, marginTop: -8, marginBottom: 14 }}>
        Photos upload straight from your device. Leave blank to show a plain placeholder instead.
      </div>
      <ErrorNote message={error} theme={theme} />
      <Button theme={theme} onClick={submit}>Post item</Button>
      {done && <div style={{ color: theme.accent, fontSize: 12.5, marginTop: 10 }}>Item posted.</div>}
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const { mode, setMode, theme, ready } = useTheme();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Loading the collection...");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // admin: all orders
  const [myOrders, setMyOrders] = useState([]); // customer: own orders
  const [bugReports, setBugReports] = useState([]);
  const [footprint, setFootprint] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const [userToken, setUserToken] = useStoredToken("tl_user_token");
  const [adminToken, setAdminToken] = useStoredToken("tl_admin_token");
  const [currentUser, setCurrentUser] = useStoredJSON("tl_user_info"); // { name, email }
  const [currentAdmin, setCurrentAdmin] = useStoredJSON("tl_admin_info"); // { email, role }

  const [cart, setCart] = useState([]);
  const [view, setView] = useState(() =>
    localStorage.getItem("tl_admin_token") ? { name: "admin" } : { name: "shop", gender: "All" }
  );
  const [activeProduct, setActiveProduct] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // initial load: catalogue is public; re-hydrate any existing session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Loading products...");
        setProgress(30);
        const p = await api("/products");
        if (!cancelled) setProducts(p);

        try {
          const s = await api("/settings");
          if (!cancelled) setCurrencySymbol(s.currencySymbol || "$");
        } catch (e) {
          // non-critical — keep the default "$" if this fails
        }

        setProgress(60);
        if (userToken && currentUser) {
          setStatus("Restoring your session...");
          try {
            const [mine, fp] = await Promise.all([
              api("/orders/mine", { token: userToken }),
              api("/footprints/mine", { token: userToken }),
            ]);
            if (!cancelled) { setMyOrders(mine); setFootprint(fp); }
          } catch (e) {
            // Token expired or invalid — drop the stale session quietly.
            setUserToken(null);
            setCurrentUser(null);
          }
        }
        if (adminToken && currentAdmin) {
          try {
            if (currentAdmin.role === "full") {
              const [ord, bugs] = await Promise.all([
                api("/orders", { token: adminToken }),
                api("/bugs", { token: adminToken }),
              ]);
              if (!cancelled) { setOrders(ord); setBugReports(bugs); }
            } else {
              const bugs = await api("/bugs", { token: adminToken });
              if (!cancelled) setBugReports(bugs);
            }
          } catch (e) {
            setAdminToken(null);
            setCurrentAdmin(null);
          }
        }

        setProgress(100);
        setStatus("Ready");
      } catch (e) {
        setStatus("Could not reach the store. Is the backend running?");
      } finally {
        setTimeout(() => { if (!cancelled) setLoading(false); }, 350);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProducts = useCallback(async () => setProducts(await api("/products")), []);

  const openProduct = (product) => {
    setActiveProduct(product);
    const entry = { productId: product.id, gender: product.gender, ts: Date.now() };
    setFootprint((f) => [...f, entry].slice(-50));
    if (userToken) {
      api("/footprints", { method: "POST", token: userToken, body: { productId: product.id, gender: product.gender } }).catch(() => {});
    }
  };

  const addToCart = (item) => setCart((c) => [...c, item]);
  const removeFromCart = (idx) => setCart((c) => c.filter((_, i) => i !== idx));

  const handleAuth = async ({ mode: authMode, email, password, name, phone, location }) => {
    const data = authMode === "signup"
      ? await api("/auth/signup", { method: "POST", body: { name, email, password, phone, location } })
      : await api("/auth/login", { method: "POST", body: { email, password } });
    setUserToken(data.token);
    setCurrentUser(data.user);
    const [mine, fp] = await Promise.all([
      api("/orders/mine", { token: data.token }),
      api("/footprints/mine", { token: data.token }),
    ]);
    setMyOrders(mine);
    setFootprint(fp);
    if (view.redirectTo === "checkout") setView({ name: "checkout" });
    else setView({ name: "shop", gender: "All" });
  };

  const handleAdminLogin = async (email, code) => {
    const data = await api("/admin/login", { method: "POST", body: { email, code } });
    setAdminToken(data.token);
    setCurrentAdmin(data.admin);
    if (data.admin.role === "full") {
      const [ord, bugs] = await Promise.all([
        api("/orders", { token: data.token }),
        api("/bugs", { token: data.token }),
      ]);
      setOrders(ord);
      setBugReports(bugs);
    } else {
      setBugReports(await api("/bugs", { token: data.token }));
    }
    setView({ name: "admin" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserToken(null);
    setCurrentAdmin(null);
    setAdminToken(null);
    setView({ name: "shop", gender: "All" });
  };

  const placeOrder = async ({ phone, location }) => {
    const order = await api("/orders", {
      method: "POST",
      token: userToken,
      body: {
        items: cart.map((c) => ({ productId: c.productId, size: c.size, color: c.color, qty: c.qty })),
        phone,
        location,
        termsAccepted: true,
      },
    });
    setMyOrders((o) => [order, ...o]);
    setCart([]);
    await refreshProducts();
    return order;
  };

  const updateProfile = async (phone, location) => {
    const data = await api("/auth/profile", { method: "PATCH", token: userToken, body: { phone, location } });
    setCurrentUser(data.user);
    return data.user;
  };

  const submitBug = (message) => api("/bugs", { method: "POST", token: userToken, body: { message } });

  const addProduct = async (product) => {
    const created = await api("/products", { method: "POST", token: adminToken, body: product });
    setProducts((p) => [created, ...p]);
  };
  const updateProduct = async (id, patch) => {
    const updated = await api(`/products/${id}`, { method: "PATCH", token: adminToken, body: patch });
    setProducts((list) => list.map((p) => (p.id === id ? updated : p)));
  };
  const deleteProduct = async (id) => {
    await api(`/products/${id}`, { method: "DELETE", token: adminToken });
    setProducts((list) => list.filter((p) => p.id !== id));
  };
  const updateOrderStatus = async (id, status) => {
    await api(`/orders/${id}/status`, { method: "PATCH", token: adminToken, body: { status } });
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  };
  const updateCurrency = async (symbol) => {
    const data = await api("/settings", { method: "PATCH", token: adminToken, body: { currencySymbol: symbol } });
    setCurrencySymbol(data.currencySymbol);
  };

  if (!ready || loading) return <LoadingScreen theme={theme} progress={progress} status={status} />;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", transition: "background .2s ease, color .2s ease" }}>
      <NavBar theme={theme} mode={mode} setMode={setMode} view={view} setView={setView} cartCount={cart.length} currentUser={currentUser} currentAdmin={currentAdmin} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {currentAdmin ? (
        <AdminDashboard
          theme={theme}
          currentAdmin={currentAdmin}
          products={products}
          orders={orders}
          bugReports={bugReports}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          updateOrderStatus={updateOrderStatus}
          currencySymbol={currencySymbol}
          updateCurrency={updateCurrency}
        />
      ) : (
        <>
          {view.name === "shop" && <ShopView products={products} theme={theme} view={view} setView={setView} openProduct={openProduct} footprint={footprint} currencySymbol={currencySymbol} />}
          {view.name === "about" && <AboutView theme={theme} />}
          {view.name === "cart" && <CartView cart={cart} theme={theme} setView={setView} removeFromCart={removeFromCart} currentUser={currentUser} currencySymbol={currencySymbol} />}
          {view.name === "login" && <LoginView theme={theme} setView={setView} onLogin={handleAuth} redirectTo={view.redirectTo} />}
          {view.name === "checkout" && currentUser && <CheckoutView theme={theme} cart={cart} placeOrder={placeOrder} setView={setView} currencySymbol={currencySymbol} currentUser={currentUser} updateProfile={updateProfile} />}
          {view.name === "account" && currentUser && <AccountView theme={theme} currentUser={currentUser} myOrders={myOrders} submitBug={submitBug} onLogout={handleLogout} currencySymbol={currencySymbol} updateProfile={updateProfile} />}
          {view.name === "admin-login" && <AdminLoginView theme={theme} onAdminLogin={handleAdminLogin} />}
        </>
      )}

      {activeProduct && <ProductDetail product={activeProduct} theme={theme} onClose={() => setActiveProduct(null)} addToCart={addToCart} currencySymbol={currencySymbol} />}

      <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: 40, padding: "26px 20px", textAlign: "center", fontSize: 12, opacity: 0.55 }}>
        THATHA LENTO — questions? message us on{" "}
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ color: theme.accent }}>WhatsApp</a>.
      </div>
    </div>
  );
}
