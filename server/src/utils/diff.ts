export function diffObjects<T extends Record<string, any>>(oldObj: T, newObj: T) {
  const diff: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  for (const key of keys) {
    const oldVal = oldObj?.[key];
    const newVal = newObj?.[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }
  return diff;
}
