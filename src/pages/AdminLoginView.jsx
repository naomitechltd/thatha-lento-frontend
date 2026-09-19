import React, { useState } from "react";
import { Button, Field, ErrorNote, inputStyle } from "../components/ui";

export function AdminLoginView({ theme, onAdminLogin }) {
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
