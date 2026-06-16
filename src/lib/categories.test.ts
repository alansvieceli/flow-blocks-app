import { CATEGORIES, getCategoryLabel } from './categories';

describe('CATEGORIES', () => {
  it('has four entries', () => {
    expect(CATEGORIES).toHaveLength(4);
  });

  it('all entries have id and label', () => {
    CATEGORIES.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });
});

describe('getCategoryLabel', () => {
  it('returns the correct label for a known id', () => {
    expect(getCategoryLabel('foco_profundo')).toBe('Foco profundo');
    expect(getCategoryLabel('reunioes')).toBe('Reuniões');
    expect(getCategoryLabel('revisao_codigo')).toBe('Revisão de código');
    expect(getCategoryLabel('admin')).toBe('Admin');
  });
});
