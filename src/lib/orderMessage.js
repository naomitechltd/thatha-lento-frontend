import { money } from "./api";

// Shared by the WhatsApp button and the "Email us instead" option, so the
// two channels never drift out of sync with each other.
export function buildOrderMessage(order, currencySymbol) {
  const lines = [];
  lines.push("Hi Thatha Lento, here is my proof of payment.");
  lines.push("");
  lines.push(`Order date: ${new Date(order.created_at).toLocaleString()}`);
  lines.push(`Name: ${order.recipient_name || ""}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Location: ${order.location}`);
  lines.push("");
  lines.push("Items:");
  order.items.forEach((it) => {
    lines.push(`- ${it.name} | Colour: ${it.color} | Size: ${it.size} | Qty: ${it.qty} | ${money(currencySymbol, it.price * it.qty)}`);
  });
  lines.push("");
  lines.push(`Total: ${money(currencySymbol, order.total)}`);
  return lines.join("\n");
}
