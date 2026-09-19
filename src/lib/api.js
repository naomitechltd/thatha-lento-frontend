import { useState } from "react";

export const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Photo uploads go straight from the browser to Cloudinary's free tier (no
// backend storage needed). Sign up at cloudinary.com, create an "unsigned"
// upload preset, then set these two in your .env / Vercel env vars.
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

export async function uploadImageFile(file) {
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

// Formats an amount with the store's currency symbol (fetched from
// /settings, admin-editable — see AdminDashboard's "Store" tab).
export function money(symbol, amount) {
  return `${symbol}${Number(amount).toFixed(2)}`;
}

/* Centralises fetch + auth header + error surfacing so every call site gets
   consistent behaviour. Throws a plain Error with the server's message on
   non-2xx responses. */
export async function api(path, { method = "GET", token, body } = {}) {
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

/* Tokens live in localStorage so a refresh doesn't log people out. For
   stronger protection against XSS, a future version could have the backend
   set these as httpOnly cookies instead — the calling code would stay
   nearly identical. */
export function useStoredToken(key) {
  const [token, setTokenState] = useState(() => localStorage.getItem(key) || null);
  const setToken = (t) => {
    setTokenState(t);
    if (t) localStorage.setItem(key, t);
    else localStorage.removeItem(key);
  };
  return [token, setToken];
}

// Alongside the token, keep the small bit of profile info (name/email or
// email/role) the login response gave us, so a page refresh can restore
// "who's logged in" without needing a dedicated whoami endpoint.
export function useStoredJSON(key) {
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
