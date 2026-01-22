export const matchesSearch = (product, query) => {
  const q = query.toLowerCase().trim();
  if (!q) return false;

  const textMatch =
    product.name.toLowerCase().includes(q) ||
    product.description?.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q);

  const variantMatch = product.variants?.some(
    (v) =>
      v.model.toLowerCase().includes(q) &&
      v.stock > 0
  );

  return textMatch || variantMatch;
};