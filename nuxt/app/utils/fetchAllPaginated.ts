/**
 * Fetch all pages from a Laravel-style paginated API endpoint
 * and return the combined data array.
 *
 * Handles:
 * - Plain array response (non-paginated)
 * - Paginated response: { data: [...], meta: { last_page, ... }, links: {...} }
 */
export async function fetchAllPaginated<T>(
  url: string,
  options?: { query?: Record<string, any> }
): Promise<T[]> {
  const query = { page: 1, ...options?.query }

  const firstResponse: any = await $fetch(url, { query })

  // Plain array — not paginated
  if (Array.isArray(firstResponse)) {
    return firstResponse as T[]
  }

  // Paginated response: { data: [...], meta: { last_page, ... } }
  if (firstResponse?.data && Array.isArray(firstResponse.data)) {
    const all: T[] = [...firstResponse.data]
    const lastPage = firstResponse?.meta?.last_page ?? 1

    if (lastPage > 1) {
      const pagePromises: Promise<any>[] = []
      for (let p = 2; p <= lastPage; p++) {
        pagePromises.push(
          $fetch(url, { query: { ...query, page: p } })
        )
      }
      const responses = await Promise.all(pagePromises)
      for (const resp of responses) {
        if (resp?.data && Array.isArray(resp.data)) {
          all.push(...resp.data)
        }
      }
    }

    return all
  }

  return []
}
