export function formatPrice(amt: number | string): string {
  if (amt == null || amt === "") return "Rs. 0";

  const cleanAmt = typeof amt === "string" ? amt.replace(/,/g, "") : amt;

  let amount = Number(cleanAmt);
  if (isNaN(amount)) return "Rs. 0";

  const isNegative = amount < 0;
  const value = Math.abs(amount);

  const rounded = Math.round(value);

  const formatted = rounded.toLocaleString("en-IN");

  return `${isNegative ? "-" : ""}Rs. ${formatted}`;
}
