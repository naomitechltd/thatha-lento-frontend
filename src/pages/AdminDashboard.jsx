import React, { useState } from "react";
import { ShoppingBag, Plus, Trash2, Bug, Package, Tag } from "lucide-react";
import { Button, Field, ErrorNote, inputStyle } from "../components/ui";
import { PhotoPicker } from "../components/media";
import { money } from "../lib/api";
import { GENDERS } from "../config";

export function AdminDashboard({ theme, currentAdmin, products, orders, bugReports, addProduct, updateProduct, deleteProduct, updateOrderStatus, currencySymbol, updateCurrency }) {
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
                <span>{o.recipientName || o.userEmail}</span>
                <span>{new Date(o.createdAt).toLocaleString()}</span>
                <span>{money(currencySymbol, o.total)}</span>
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.75, marginTop: 4 }}>
                {o.userEmail} · Phone: {o.phone} · Delivering to: {o.location}
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.7, marginTop: 6 }}>
                {o.items.map((it, i) => <div key={i}>{it.name} — Colour: {it.color} · Size: {it.size} · Qty: {it.qty}</div>)}
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
                <span>{b.userEmail}</span>
                <span>{new Date(b.createdAt).toLocaleString()}</span>
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
  const [colorImages, setColorImages] = useState({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const colorList = colors.split(",").map((c) => c.trim()).filter(Boolean);

  const submit = async () => {
    setError("");
    if (!name || !price) return;
    try {
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
