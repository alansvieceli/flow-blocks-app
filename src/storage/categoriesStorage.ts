import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { sortByOrder } from '../lib/sortByOrder';
import { Category } from '../types';

const KEY = 'categories';

export async function getCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw === null) return DEFAULT_CATEGORIES;
  return sortByOrder(
    (JSON.parse(raw) as Category[]).map((category, index) => ({
      ...category,
      order: category.order ?? index + 1,
    })),
  );
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sortByOrder(categories)));
}
