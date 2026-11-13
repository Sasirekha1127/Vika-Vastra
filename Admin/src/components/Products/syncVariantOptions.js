export default function syncVariantOptions(options, variants) {
  const valuesByName = new Map();
  variants.forEach(variant => {
    Object.entries(variant.attributes || {}).forEach(([name, value]) => {
      const key = name.trim().toLowerCase();
      if (!valuesByName.has(key)) valuesByName.set(key, new Set());
      valuesByName.get(key).add(String(value).trim().toLowerCase());
    });
  });
  return options.map(option => ({
    ...option,
    values: [...(valuesByName.get(option.name.trim().toLowerCase()) || [])],
  }));
}
