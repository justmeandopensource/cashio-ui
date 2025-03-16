export type CurrencyCode = "GBP" | "INR" | "USD" | "EUR";

export const currencySymbols: Record<CurrencyCode, string> = {
  GBP: "£",
  INR: "₹",
  USD: "$",
  EUR: "€",
};

export const currencyLocales: Record<CurrencyCode, string> = {
  GBP: "en-GB",
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

export const formatNumberAsCurrency = (
  number: number,
  currencyCode: string,
): string => {
  const symbol = currencySymbols[currencyCode as CurrencyCode] || currencyCode;
  const locale = currencyLocales[currencyCode as CurrencyCode] || "en-GB";
  const formattedBalance = Number(number).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedBalance}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0].replace(/-/g, "/");
};

interface FormattedAmount {
  value: string;
  color: string;
  prefix: string;
}

export const formatAmount = (
  credit: number,
  debit: number,
  currencySymbolCode: string,
): FormattedAmount => {
  const amount = credit > 0 ? credit : debit;
  const formattedAmount = formatNumberAsCurrency(amount, currencySymbolCode);
  if (credit > 0) {
    return { value: formattedAmount, color: "teal.500", prefix: "+" };
  } else {
    return { value: formattedAmount, color: "red.500", prefix: "-" };
  }
};
