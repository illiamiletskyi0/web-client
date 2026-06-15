import type { Post } from '~/types/post'

export function normalizePost(raw: unknown): Post | null {
  if (!raw || typeof raw !== 'object') return null

  const obj = raw as Record<string, unknown>

  // Unwrap { success: true, data: { ... } }
  if ('success' in obj && 'data' in obj) {
    const data = obj.data
    if (data && typeof data === 'object' && 'id' in data && 'title' in data) {
      return mapPost(data as Record<string, unknown>)
    }
    return null
  }

  // Direct object: { id: 1, title: "...", ... }
  if ('id' in obj && 'title' in obj) {
    return mapPost(obj)
  }

  // Wrapped response: { data: { id: 1, title: "...", ... } }
  if ('data' in obj) {
    const data = obj.data
    if (data && typeof data === 'object' && 'id' in data && 'title' in data) {
      return mapPost(data as Record<string, unknown>)
    }
  }

  return null
}

function mapPost(obj: Record<string, unknown>): Post {
  // category_title/category_id comes from:
  // - List endpoint: direct `category_title` / `category_id` fields
  // - Single post endpoint: `category` field is an object with `.title` / `.id`
  const categoryObj = obj.category
  const categoryId =
    (obj.category_id as number | undefined) ??
    (categoryObj && typeof categoryObj === 'object'
      ? (categoryObj as Record<string, unknown>).id as number
      : 0)
  const categoryTitle =
    (obj.category_title as string | undefined) ??
    (typeof categoryObj === 'string' ? categoryObj : null) ??
    (categoryObj && typeof categoryObj === 'object'
      ? (categoryObj as Record<string, unknown>).title as string ?? null
      : null)

  return {
    id: obj.id as number,
    title: obj.title as string,
    slug: obj.slug as string,
    excerpt: (obj.excerpt as string) ?? null,
    content_raw: (obj.content_raw as string) ?? null,
    is_published: (obj.is_published as boolean) ?? false,
    date_published: (obj.date_published as string) ?? null,
    category_id: categoryId,
    category_title: categoryTitle,
    category: typeof obj.category === 'string'
      ? null
      : (obj.category as Record<string, unknown> | null) ?? null,
    author: obj.author && typeof obj.author === 'object'
      ? { id: (obj.author as Record<string, unknown>).id as number, name: (obj.author as Record<string, unknown>).name as string }
      : null
  }
}

export function normalizePosts(raw: unknown): Post[] {
  if (Array.isArray(raw)) return raw.map(o => mapPost(o as Record<string, unknown>))
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
    return (raw as any).data.map((o: Record<string, unknown>) => mapPost(o))
  }
  return []
}
