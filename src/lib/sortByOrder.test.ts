import { getItemOrder, sortByOrder } from './sortByOrder';

describe('getItemOrder', () => {
  it('returns item.order when numeric and finite', () => {
    expect(getItemOrder({ order: 3 })).toBe(3);
    expect(getItemOrder({ order: 0 })).toBe(0);
  });

  it('returns MAX_SAFE_INTEGER when order is missing', () => {
    expect(getItemOrder({})).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('returns MAX_SAFE_INTEGER when order is Infinity', () => {
    expect(getItemOrder({ order: Infinity })).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('sortByOrder', () => {
  it('sorts by order ascending', () => {
    const items = [
      { order: 3, label: 'C' },
      { order: 1, label: 'A' },
      { order: 2, label: 'B' },
    ];
    expect(sortByOrder(items).map((i) => i.label)).toEqual(['A', 'B', 'C']);
  });

  it('uses label as tiebreaker when orders are equal', () => {
    const items = [
      { order: 1, label: 'Beta' },
      { order: 1, label: 'Alpha' },
    ];
    expect(sortByOrder(items).map((i) => i.label)).toEqual(['Alpha', 'Beta']);
  });

  it('uses name as tiebreaker when label is absent', () => {
    const items = [
      { order: 1, name: 'Zebra' },
      { order: 1, name: 'Ant' },
    ];
    expect(sortByOrder(items).map((i) => i.name)).toEqual(['Ant', 'Zebra']);
  });

  it('places items without order after items with order', () => {
    const items = [{ label: 'NoOrder' }, { order: 1, label: 'HasOrder' }];
    expect(sortByOrder(items).map((i) => i.label)).toEqual(['HasOrder', 'NoOrder']);
  });

  it('does not mutate the original array', () => {
    const items = [
      { order: 2, label: 'B' },
      { order: 1, label: 'A' },
    ];
    const copy = [...items];
    sortByOrder(items);
    expect(items).toEqual(copy);
  });

  it('returns empty array for empty input', () => {
    expect(sortByOrder([])).toEqual([]);
  });
});
