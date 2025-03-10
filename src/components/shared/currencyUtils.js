
export const currencySymbols = {
  GBP: '£',
  INR: '₹',
  USD: '$',
  EUR: '€',
}

export const currencyLocales = {
  GBP: 'en-GB',
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
}

  // Helper function to format balance with currency symbol
export const formatNumberAsCurrency = (number, currencyCode) => {
  const symbol = currencySymbols[currencyCode] || currencyCode
  const locale = currencyLocales[currencyCode] || 'en-GB'
  const formattedBalance = Number(number).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${symbol}${formattedBalance}`
}
