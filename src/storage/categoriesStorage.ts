import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES, LOCKED_CATEGORY } from '../lib/categories';
import { sortByOrder } from '../lib/sortByOrder';
import { Category } from '../types';

const KEY = 'categories';

function ensureLockedCategory(categories: Category[]): Category[] {
  const withoutLocked = categories.filter((c) => c.id !== LOCKED_CATEGORY.id);
  const reordered = withoutLocked.map((c) => ({
    ...c,
    order: c.order <= 1 ? c.order + 1 : c.order,
  }));
  return sortByOrder([LOCKED_CATEGORY, ...reordered]);
}

export async function getCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (raw === null) return DEFAULT_CATEGORIES;
  const parsed = (JSON.parse(raw) as Category[]).map((category, index) => ({
    ...category,
    order: category.order ?? index + 1,
  }));
  return ensureLockedCategory(parsed);
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(ensureLockedCategory(categories)));
}
