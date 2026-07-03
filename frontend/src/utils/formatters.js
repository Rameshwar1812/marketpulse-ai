export const formatCurrency = (value) => {
  if (value === undefined || value === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === undefined || value === null) return "0.0%";
  // If the DB returns a decimal (e.g. 0.88), convert it to 88%
  const val = value <= 1.0 && value > 0 ? value * 100 : value;
  return `${val.toFixed(1)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export const formatNumber = (value) => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("en-US").format(value);
};
