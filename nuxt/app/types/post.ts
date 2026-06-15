export interface PostAuthor {
  id: number
  name: string
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content_raw: string | null
  is_published: boolean
  date_published: string | null
  category_id: number
  category_title: string | null
  category: Record<string, unknown> | null
  author: PostAuthor | null
}

export interface PostFormData {
  title: string
  slug: string
  content_raw: string
  is_published: boolean
  date_published: string
  category_id: number | undefined
}

export interface PostFormPayload {
  title: string
  slug: string
  content_raw: string | null
  is_published: boolean
  date_published: string | null
  category_id: number | null
}
