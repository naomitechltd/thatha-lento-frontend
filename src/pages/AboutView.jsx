import React from "react";
import logo from "../pictures/logo.png";   // or "../pictures/THATHA LENTO.png" if you keep the original name

const OWNER_PHOTO_URL = "";
const OWNER_NAME = "Owner name here";
const LOGO_URL = logo;

export function AboutView({ theme }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "56px 20px 80px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        {LOGO_URL ? (
          <img src={LOGO_URL} alt="Thatha Lento logo" style={{ height: 90, width: 90, objectFit: "contain" }} />
        ) : (
          <div style={{ height: 90, width: 90, borderRadius: "50%", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, opacity: 0.5, textAlign: "center", padding: 8 }}>
            Logo placeholder
          </div>
        )}
      </div>

      <div style={{ fontFamily: "'Iowan Old Style', Georgia, serif", fontSize: 30, marginBottom: 18, textAlign: "center" }}>About Thatha Lento</div>
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

      <div style={{ marginTop: 40, paddingTop: 30, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 16 }}>
        {OWNER_PHOTO_URL ? (
          <img src={OWNER_PHOTO_URL} alt={OWNER_NAME} style={{ height: 64, width: 64, borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: 64, width: 64, borderRadius: "50%", border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, opacity: 0.5, textAlign: "center" }}>
            Owner photo
          </div>
        )}
        <div>
          <div style={{ fontSize: 13, opacity: 0.6 }}>Founder</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{OWNER_NAME}</div>
        </div>
      </div>
    </div>
  );
}
