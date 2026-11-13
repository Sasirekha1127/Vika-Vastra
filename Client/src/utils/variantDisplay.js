export const formatVariantLabel = (item = {}) => {
  if (item.weight || item.variantName) return item.weight || item.variantName;
  const attributes = item.Variant?.attributes || item.variantAttributes || item.selectedVariant?.attributes;
  if (!attributes || typeof attributes !== 'object') return '';
  return Object.entries(attributes)
    .filter(([key, value]) => key.toLowerCase() !== 'default' && value != null && String(value).trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join(' / ');
};
