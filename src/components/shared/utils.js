export const currencySymbols = {
  GBP: "£",
  INR: "₹",
  USD: "$",
  EUR: "€",
};

export const currencyLocales = {
  GBP: "en-GB",
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
};

export const formatNumberAsCurrency = (number, currencyCode) => {
  const symbol = currencySymbols[currencyCode] || currencyCode;
  const locale = currencyLocales[currencyCode] || "en-GB";
  const formattedBalance = Number(number).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedBalance}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0].replace(/-/g, "/");
};

export const formatAmount = (credit, debit, currencySymbolCode) => {
  const amount = credit > 0 ? credit : debit;
  const formattedAmount = formatNumberAsCurrency(amount, currencySymbolCode);
  if (credit > 0) {
    return { value: formattedAmount, color: "teal.500", prefix: "+" };
  } else {
    return { value: formattedAmount, color: "red.500", prefix: "-" };
  }
};
