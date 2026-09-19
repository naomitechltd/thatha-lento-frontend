import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../components/ui";
import { money } from "../lib/api";

export function CartView({ cart, theme, setView, removeFromCart, currentUser, currencySymbol }) {
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
                  <div style={{ fontSize: 12.5, opacity: 0.65 }}>Colour: {item.color} · Size: {item.size} · Qty: {item.qty}</div>
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
