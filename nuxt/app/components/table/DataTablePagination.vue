<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const startItem = computed(() =>
  props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.pageSize + 1
)
const endItem = computed(() =>
  Math.min(props.currentPage * props.pageSize, props.totalItems)
)

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = props.totalPages
  const current = props.currentPage
  const delta = 2

  let start = Math.max(1, current - delta)
  let end = Math.min(total, current + delta)

  if (current - delta < 1) {
    end = Math.min(total, end + (delta - current + 1))
  }
  if (current + delta > total) {
    start = Math.max(1, start - (current + delta - total))
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div class="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
    <p class="text-sm text-gray-500">
      Showing
      <span class="font-semibold text-gray-900">{{ startItem }}</span>–<span class="font-semibold text-gray-900">{{ endItem }}</span>
      of
      <span class="font-semibold text-gray-900">{{ totalItems }}</span>
      results
    </p>

    <nav class="flex items-center gap-1" aria-label="Pagination">
      <button
        :disabled="currentPage <= 1"
        class="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        ← Previous
      </button>

      <template v-for="page in visiblePages" :key="page">
        <button
          class="min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            page === currentPage
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          "
          @click="emit('update:currentPage', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        :disabled="currentPage >= totalPages"
        class="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        Next →
      </button>
    </nav>
  </div>
</template>
