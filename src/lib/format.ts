export const formatPrice = (kobo: number, currency = "NGN"): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }).format(kobo / 100);

export const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export const pluralize = (count: number, singular: string, plural = `${singular}s`): string =>
  `${count} ${count === 1 ? singular : plural}`;
