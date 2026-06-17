export interface OrderedItem {
  name?: string;
  label?: string;
  order?: number;
}

export function getItemOrder(item: OrderedItem): number {
  return typeof item.order === 'number' && Number.isFinite(item.order)
    ? item.order
    : Number.MAX_SAFE_INTEGER;
}

export function sortByOrder<T extends OrderedItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const orderDiff = getItemOrder(a) - getItemOrder(b);
    if (orderDiff !== 0) return orderDiff;
    return (a.label ?? a.name ?? '').localeCompare(b.label ?? b.name ?? '');
  });
}
