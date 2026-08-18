/**
 * Indian Rupee Formatting Utility (BUG 1A)
 * Rules:
 * Below ₹1,00,000      -> ₹XX,XXX
 * ₹1,00,000 - 99,99,999 -> ₹X.XL / ₹XX.XL
 * ₹1,00,00,000+        -> ₹X.XCr / ₹XX.XCr
 */
export const formatINR = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.abs(val);
  if (num < 100000) {
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  } else if (num < 10000000) {
    const lakhs = num / 100000;
    const formatted = parseFloat(lakhs.toFixed(2));
    return `₹${formatted}L`;
  } else {
    const crores = num / 10000000;
    const formatted = parseFloat(crores.toFixed(2));
    return `₹${formatted}Cr`;
  }
};
