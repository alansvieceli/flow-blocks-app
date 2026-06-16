import { CategoryId } from '../types';

export interface Category {
  id: CategoryId;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: 'foco_profundo', label: 'Foco profundo' },
  { id: 'reunioes', label: 'Reuniões' },
  { id: 'revisao_codigo', label: 'Revisão de código' },
  { id: 'admin', label: 'Admin' },
];

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
