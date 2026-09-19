import React, { useState } from "react";
import { Button, Field, ErrorNote, inputStyle } from "../components/ui";
import { LocationPicker } from "../components/LocationPicker";

export function LoginView({ theme, setView, onLogin, redirectTo }) {
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
          <LocationPicker theme={theme} value={location} onChange={setLocation} />
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
