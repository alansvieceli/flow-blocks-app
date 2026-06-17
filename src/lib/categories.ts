import { Category, CategoryId } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'reuniao', label: 'Reunião', order: 1 },
  { id: 'foco', label: 'Foco', order: 2 },
];

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

export function isFocusCategory(id: CategoryId): boolean {
  return id === 'foco' || id === 'foco_profundo';
}
