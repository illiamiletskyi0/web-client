import type { Category } from '~/types/category'

export function normalizeCategories(raw: unknown): Category[] {
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    return (raw as any).data
  }
  return []
}
