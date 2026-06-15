import type { Category } from '~/types/category'

export function normalizeCategory(raw: unknown): Category | null {
  if (!raw || typeof raw !== 'object') return null

  const obj = raw as Record<string, unknown>

  // Unwrap { success: true, data: { id: 1, title: "News", ... } } or { success: true, data: [...] } 
  if ('success' in obj && 'data' in obj) {
    const data = obj.data
    if (data && typeof data === 'object' && 'id' in data && 'title' in data) {
      return data as Category
    }
    // { success: true, data: null/undefined } — no category data
    return null
  }

  // Direct object: { id: 1, title: "News", ... }
  if ('id' in obj && 'title' in obj) {
    return obj as unknown as Category
  }

  // Wrapped response: { data: { id: 1, title: "News", ... } }
  if ('data' in obj) {
    const data = obj.data
    if (data && typeof data === 'object' && 'id' in data && 'title' in data) {
      return data as Category
    }
  }

  return null
}

export function isSuccessResponse(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  return 'success' in (raw as Record<string, unknown>) && (raw as Record<string, unknown>).success === true
}
