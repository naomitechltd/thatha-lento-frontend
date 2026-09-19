import React from "react";
import { ShoppingBag, Sun, Moon, Menu, X, User, LogOut } from "lucide-react";

export function NavBar({ theme, mode, setMode, view, setView, cartCount, currentUser, currentAdmin, onLogout, mobileOpen, setMobileOpen }) {
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
