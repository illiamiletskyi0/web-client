<script setup lang="ts">
import type { ProductSortField } from '~/types/product'

const {
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
} = await useTableData()

interface Column {
  key: ProductSortField
  label: string
}

const columns: Column[] = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'brand', label: 'Brand' },
  { key: 'category', label: 'Category' }
]

function sortIcon(field: ProductSortField): string {
  if (sortField.value !== field) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <TableSearchInput v-model="searchQuery" />

      <p class="shrink-0 text-sm text-gray-500">
        <span class="font-semibold text-gray-900">{{ totalItems }}</span> products found
      </p>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-24"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
        <p class="text-sm text-gray-500">Loading products…</p>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
    >
      <p class="text-sm font-medium text-red-700">
        Failed to load products. Please try again later.
      </p>
      <p class="mt-1 text-xs text-red-500">{{ error.message }}</p>
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full min-w-225 text-left">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50/80">
              <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Thumbnail
              </th>
              <th
                v-for="col in columns"
                :key="col.key"
                class="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:text-gray-900"
                :class="{ 'text-gray-900': sortField === col.key }"
                @click="toggleSort(col.key)"
              >
                <span class="inline-flex items-center gap-1.5">
                  {{ col.label }}
                  <span
                    class="text-[10px]"
                    :class="sortField === col.key ? 'text-gray-900' : 'text-gray-300'"
                  >
                    {{ sortIcon(col.key) }}
                  </span>
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="paginatedProducts.length === 0">
              <td colspan="7" class="px-4 py-20 text-center">
                <p class="text-sm text-gray-400">No products match your search.</p>
              </td>
            </tr>

            <TableDataTableRow
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
            />
          </tbody>
        </table>
      </div>

      <div class="border-t border-gray-200 bg-gray-50/50 px-4 py-3">
        <TableDataTablePagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :page-size="pageSize"
          @update:current-page="goToPage"
        />
      </div>
    </div>
  </div>
</template>
