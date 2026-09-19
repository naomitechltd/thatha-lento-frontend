import React, { useState } from "react";
import { Check } from "lucide-react";
import { Button, Field, ErrorNote, inputStyle } from "../components/ui";
import { LocationPicker } from "../components/LocationPicker";
import { money } from "../lib/api";
import { buildOrderMessage } from "../lib/orderMessage";
import { WHATSAPP_NUMBER, STORE_EMAIL, PAY_DETAILS } from "../config";
import { TERMS_OF_USE_TEXT } from "../legal";

export function CheckoutView({ theme, cart, placeOrder, setView, currencySymbol, currentUser, updateProfile }) {
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [placed, setPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // snapshot of the real order, so its total/details survive the cart being cleared
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [editingDelivery, setEditingDelivery] = useState(!currentUser?.phone || !currentUser?.location);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  if (cart.length === 0 && !placed) {
    return <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px" }}><div style={{ opacity: 0.7 }}>Your bag is empty.</div></div>;
  }

  const confirm = async () => {
    setError("");
    if (!phone.trim() || !location.trim()) { setError("A phone number and location are required for delivery."); return; }
    if (!termsAccepted) { setError("Please agree to the Terms of Use to continue."); return; }
    setBusy(true);
    try {
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

  const waLink = placedOrder
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage(placedOrder, currencySymbol))}`
    : "#";
  const emailLink = placedOrder
    ? `mailto:${STORE_EMAIL}?subject=${encodeURIComponent("Proof of payment — order " + placedOrder.id)}&body=${encodeURIComponent(buildOrderMessage(placedOrder, currencySymbol))}`
    : "#";

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 24, marginBottom: 20 }}>Checkout</div>

      {!placed ? (
        <>
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Order summary</div>
            {cart.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                  <span>{item.name}</span>
                  <span>{money(currencySymbol, item.price * item.qty)}</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Colour: {item.color} · Size: {item.size} · Qty: {item.qty}</div>
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
                <LocationPicker theme={theme} value={location} onChange={setLocation} />
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
              Transfer the total above, then send proof of payment via WhatsApp or email.
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
            Send your payment screenshot so we can confirm and start preparing your order — choose whichever's easiest.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button theme={theme}>Send via WhatsApp</Button>
            </a>
            <a href={emailLink}>
              <Button theme={theme} variant="outline">Send via email</Button>
            </a>
          </div>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setView({ name: "shop", gender: "All" })} style={{ background: "none", border: "none", color: theme.accent, cursor: "pointer", fontFamily: "inherit" }}>Continue shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
