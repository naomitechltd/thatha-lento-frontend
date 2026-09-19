import React, { useState } from "react";
import { Button, ErrorNote, inputStyle, Field } from "../components/ui";
import { LocationPicker } from "../components/LocationPicker";
import { money } from "../lib/api";

export function AccountView({ theme, currentUser, myOrders, submitBug, onLogout, currencySymbol, updateProfile }) {
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
            <LocationPicker theme={theme} value={location} onChange={setLocation} />
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
                <span>{new Date(o.created_at).toLocaleString()}</span>
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
