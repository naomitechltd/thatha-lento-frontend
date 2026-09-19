import React from "react";
import { TERMS_OF_USE_TEXT, TERMS_AND_CONDITIONS_TEXT, PRIVACY_POLICY_TEXT, DEVELOPER_INFO } from "../legal";

function LegalPage({ title, text }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 26, marginBottom: 20 }}>{title}</div>
      <div style={{ lineHeight: 1.8, opacity: 0.85, fontSize: 14, whiteSpace: "pre-wrap" }}>{text}</div>
    </div>
  );
}

export function TermsOfUsePage() {
  return <LegalPage title="Terms of Use" text={TERMS_OF_USE_TEXT} />;
}

export function TermsAndConditionsPage() {
  return <LegalPage title="Terms &amp; Conditions" text={TERMS_AND_CONDITIONS_TEXT} />;
}

export function PrivacyPolicyPage() {
  return <LegalPage title="Privacy Policy" text={PRIVACY_POLICY_TEXT} />;
}

export function DeveloperPage({ theme }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 26, marginBottom: 20 }}>Developer</div>
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 18, fontSize: 14, lineHeight: 1.8 }}>
        <div>Built by: <strong>{DEVELOPER_INFO.builtBy}</strong></div>
        <div>Contact: {DEVELOPER_INFO.contactEmail}</div>
      </div>
      <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7, lineHeight: 1.7 }}>{DEVELOPER_INFO.note}</p>
    </div>
  );
}
