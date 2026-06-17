import { DEFAULT_CATEGORIES, getCategoryLabel, isFocusCategory } from './categories';

describe('DEFAULT_CATEGORIES', () => {
  it('has the installation defaults', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      { id: 'reuniao', label: 'Reunião', order: 1 },
      { id: 'foco', label: 'Foco', order: 2 },
    ]);
  });

  it('all entries have id and label', () => {
    DEFAULT_CATEGORIES.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
    });
  });
});

describe('getCategoryLabel', () => {
  it('returns the correct label for a known id', () => {
    expect(getCategoryLabel('foco')).toBe('Foco');
    expect(getCategoryLabel('reuniao')).toBe('Reunião');
  });

  it('keeps legacy labels readable', () => {
    expect(getCategoryLabel('foco_profundo')).toBe('Foco profundo');
    expect(getCategoryLabel('reunioes')).toBe('Reuniões');
  });
});

describe('isFocusCategory', () => {
  it('recognizes current and legacy focus category ids', () => {
    expect(isFocusCategory('foco')).toBe(true);
    expect(isFocusCategory('foco_profundo')).toBe(true);
    expect(isFocusCategory('reuniao')).toBe(false);
  });
});
