const slugify = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

// Keep the database ID at the end so product names can repeat and legacy ID
// routes can still be resolved without adding a database migration.
export const getProductUrl = (product = {}) => {
  const id = product.id ?? product.productId;
  if (id == null) return '/shop';
  const name = product.productName ?? product.name ?? product.title ?? '';
  const slug = slugify(name);
  return `/product/${slug ? `${slug}-` : ''}${id}`;
};
