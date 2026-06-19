import {
  DEFAULT_CATEGORIES,
  getCategoryLabel,
  isFocusCategory,
  isLockedCategory,
} from './categories';

describe('DEFAULT_CATEGORIES', () => {
  it('has the installation defaults with Foco first and marked as focus', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      { id: 'foco', label: 'Foco', order: 1, isFocus: true },
      { id: 'reuniao', label: 'Reunião', order: 2 },
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
  it('recognizes current and legacy focus category ids via the default list', () => {
    expect(isFocusCategory('foco')).toBe(true);
    expect(isFocusCategory('foco_profundo')).toBe(true);
    expect(isFocusCategory('reuniao')).toBe(false);
  });

  it('returns true for a custom category explicitly marked isFocus', () => {
    const categories = [{ id: 'codigo', label: 'Código', order: 2, isFocus: true }];
    expect(isFocusCategory('codigo', categories)).toBe(true);
  });

  it('returns false for a custom category not marked isFocus', () => {
    const categories = [{ id: 'codigo', label: 'Código', order: 2 }];
    expect(isFocusCategory('codigo', categories)).toBe(false);
  });

  it('falls back to legacy ids when the category is not in the list', () => {
    const categories = [{ id: 'reuniao', label: 'Reunião', order: 2 }];
    expect(isFocusCategory('foco_profundo', categories)).toBe(true);
    expect(isFocusCategory('admin', categories)).toBe(false);
  });
});

describe('isLockedCategory', () => {
  it('returns true only for the locked foco id', () => {
    expect(isLockedCategory('foco')).toBe(true);
    expect(isLockedCategory('reuniao')).toBe(false);
    expect(isLockedCategory('custom')).toBe(false);
  });
});
