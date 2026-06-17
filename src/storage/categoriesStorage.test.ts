import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES, LOCKED_CATEGORY } from '../lib/categories';
import { Category } from '../types';
import { getCategories, saveCategories } from './categoriesStorage';

const custom: Category = { id: 'custom', label: 'Custom', order: 3 };

describe('categoriesStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns installation defaults when absent', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await getCategories()).toEqual(DEFAULT_CATEGORIES);
  });

  it('always keeps Foco at order 1 after save and retrieve', async () => {
    let stored: string | null = null;
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      (_key: string, value: string) => {
        stored = value;
        return Promise.resolve();
      },
    );
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
      Promise.resolve(stored),
    );

    await saveCategories([custom]);
    const result = await getCategories();
    expect(result[0]).toEqual(LOCKED_CATEGORY);
    expect(result.find((c) => c.id === 'custom')).toEqual({ ...custom, order: 3 });
  });

  it('prevents order 1 from being assigned to non-locked categories', async () => {
    let stored: string | null = null;
    (AsyncStorage.setItem as jest.Mock).mockImplementation(
      (_key: string, value: string) => {
        stored = value;
        return Promise.resolve();
      },
    );
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
      Promise.resolve(stored),
    );

    await saveCategories([{ ...custom, order: 1 }]);
    const result = await getCategories();
    expect(result[0]).toEqual(LOCKED_CATEGORY);
    const savedCustom = result.find((c) => c.id === 'custom');
    expect(savedCustom?.order).toBeGreaterThan(1);
  });
});
