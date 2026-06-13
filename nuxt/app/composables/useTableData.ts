import type { Product, ProductsResponse, ProductSortField, SortDirection } from '~/types/product'

export async function useTableData() {
  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 300)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const sortField = ref<ProductSortField>('title')
  const sortDirection = ref<SortDirection>('asc')

  const { data, status, error } = await useFetch<ProductsResponse>('https://dummyjson.com/products', {
    key: 'products-table',
    query: { limit: 100, select: 'title,description,price,rating,brand,category,thumbnail' }
  })

  const products = computed<Product[]>(() => data.value?.products ?? [])

  const filteredProducts = computed(() => {
    const query = debouncedSearch.value.toLowerCase().trim()
    if (!query) return products.value
    return products.value.filter(p =>
      p.title.toLowerCase().includes(query)
      || p.description.toLowerCase().includes(query)
      || (p.brand && p.brand.toLowerCase().includes(query))
      || p.category.toLowerCase().includes(query)
    )
  })

  const sortedProducts = computed(() => {
    const items = [...filteredProducts.value]
    const field = sortField.value
    const dir = sortDirection.value === 'asc' ? 1 : -1

    return items.sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir
      }
      return ((aVal as number) - (bVal as number)) * dir
    })
  })

  const totalItems = computed(() => filteredProducts.value.length)
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return sortedProducts.value.slice(start, start + pageSize.value)
  })

  watch(debouncedSearch, () => {
    currentPage.value = 1
  })

  function toggleSort(field: ProductSortField) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
    currentPage.value = 1
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    searchQuery,
    currentPage,
    pageSize,
    sortField,
    sortDirection,
    status,
    error,
    paginatedProducts,
    totalPages,
    totalItems,
    toggleSort,
    goToPage
  }
}
