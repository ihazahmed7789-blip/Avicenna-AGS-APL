function normalizePakistanWhatsAppNumber(value) {
  let digits = String(value ?? "").trim().replace(/[^\d]/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  if (digits.startsWith("92")) {
    // already international
  } else if (digits.startsWith("0")) {
    digits = `92${digits.slice(1)}`;
  } else if (digits.length === 10 && digits.startsWith("3")) {
    digits = `92${digits}`;
  } else {
    return null;
  }

  if (!/^923\d{9}$/.test(digits)) return null;
  return digits;
}

module.exports = { normalizePakistanWhatsAppNumber };
