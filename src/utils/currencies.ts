export const currencies = ["USD", "EUR", "GBP", "RUB"];

export function isCurrency(
  value: string
): value is (typeof currencies)[number] {
  return currencies.includes(value as (typeof currencies)[number]);
}

export function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    RUB: "₽",
  };
  return currencySymbols[currency] || "";
}

export function formatCurrency(value: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  if (currency === "RUB") {
    return `${value} ${symbol}`;
  }
  return `${symbol} ${value}`;
}
