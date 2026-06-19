import { Category, CategoryId } from '../types';

export const LOCKED_CATEGORY: Category = {
  id: 'foco',
  label: 'Foco',
  order: 1,
  isFocus: true,
};

export const DEFAULT_CATEGORIES: Category[] = [
  LOCKED_CATEGORY,
  { id: 'reuniao', label: 'Reunião', order: 2 },
];

export function isLockedCategory(id: CategoryId): boolean {
  return id === LOCKED_CATEGORY.id;
}

const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  admin: 'Admin',
  foco_profundo: 'Foco profundo',
  reunioes: 'Reuniões',
  revisao_codigo: 'Revisão de código',
};

export function getCategoryLabel(
  id: CategoryId,
  categories: Category[] = DEFAULT_CATEGORIES,
): string {
  return categories.find((c) => c.id === id)?.label ?? LEGACY_CATEGORY_LABELS[id] ?? id;
}

export function isFocusCategory(
  id: CategoryId,
  categories: Category[] = DEFAULT_CATEGORIES,
): boolean {
  const found = categories.find((c) => c.id === id);
  if (found) return found.isFocus === true;
  return id === 'foco' || id === 'foco_profundo';
}
