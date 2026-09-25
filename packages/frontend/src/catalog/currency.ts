const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatPrice(price: number): string {
  return priceFormatter.format(price);
}

export { formatPrice };
