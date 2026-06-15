export interface Category {
  id: number
  title: string
  slug: string
  description: string | null
  parent_id: number | null
  parent_title: string | null
}
