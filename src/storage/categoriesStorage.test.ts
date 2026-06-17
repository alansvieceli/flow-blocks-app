import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { Category } from '../types';
import { getCategories, saveCategories } from './categoriesStorage';

const category: Category = { id: 'custom', label: 'Custom', order: 3 };

describe('categoriesStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns installation defaults when absent', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    expect(await getCategories()).toEqual(DEFAULT_CATEGORIES);
  });

  it('saves and retrieves categories', async () => {
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

    await saveCategories([category]);
    expect(await getCategories()).toEqual([category]);
  });
});
