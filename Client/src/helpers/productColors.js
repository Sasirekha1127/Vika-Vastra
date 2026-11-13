export const getProductColors = product => {
  const parse = value => {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return null; }
  };
  let colors;
  if (Array.isArray(product.Variants) && product.Variants.length) {
    colors = product.Variants.filter(variant => variant.isActive !== false).flatMap(variant => {
      const attributes = parse(variant.attributes);
      if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) return [];
      return Object.entries(attributes).filter(([key]) => key.trim().toLowerCase() === 'color').map(([, value]) => value);
    });
  } else {
    colors = parse(product.colors);
  }
  return [...new Set((Array.isArray(colors) ? colors : []).filter(value => typeof value === 'string').map(value => value.trim().toLowerCase()).filter(Boolean))];
};

export const matchesColors = (product, selected) => !selected.length || selected.some(color => product.colors.includes(color));
