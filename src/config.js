// Store-wide settings you'll actually want to change from time to time.
// Keeping these in their own small file means updating a phone number or
// bank detail never requires touching (or re-pasting) any component code.

// WhatsApp number in digits only — country code first, no "+", no spaces.
// e.g. South Africa 072 998 9988 -> "27729989988"
export const WHATSAPP_NUMBER = "27729989988";

// A real inbox that receives "proof of payment" emails.
export const STORE_EMAIL = "orders@thathalento.com"; // placeholder — update with your real order inbox

export const PAY_DETAILS = {
  bank: "Thatha Lento Ltd.",
  account: "511 4454 1890",
  bankName: "TymeBank Limited",
  swift: "CBZAZAJJXXX",
};

export const GENDERS = ["Male", "Female"];

// Shown as a dropdown when a customer says they're in Nkomazi.
export const NKOMAZI_AREAS = ["Boschfontein", "Aniva", "Driekoppies", "Langeloop", "Kamhlushwa", "Tonga", "Mdladla", "Phiva", "Mzinti", "Schoemansdal", "Baffelspruit", "Magogeni", "Shiba", "Mbuzini”];
