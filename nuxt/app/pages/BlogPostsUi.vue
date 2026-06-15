<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Post } from '~/types/post'

useSeoMeta({
  title: 'Блог — Публікації (UI)',
  description: 'Управління публікаціями блогу з використанням Nuxt UI Table.'
})

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const page = ref(1)
const pageSize = 10
const searchQuery = ref('')
watch(searchQuery, () => {
  page.value = 1
})

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({ column: 'id', direction: 'asc' })

const filteredPosts = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return posts.value
  return posts.value.filter(p =>
    p.title.toLowerCase().includes(query)
    || (p.excerpt && p.excerpt.toLowerCase().includes(query))
    || (p.category_title && p.category_title.toLowerCase().includes(query))
  )
})

const sortedPosts = computed(() => {
  const items = [...filteredPosts.value]
  const field = sort.value.column as keyof Post
  const dir = sort.value.direction === 'asc' ? 1 : -1

  return items.sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal == null && bVal == null) return 0
    if (aVal == null) return 1
    if (bVal == null) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * dir
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return (aVal === bVal ? 0 : aVal ? -1 : 1) * dir
    }
    if (field === 'author') {
      const aName = aVal && typeof aVal === 'object' ? (aVal as Record<string, unknown>).name as string ?? '' : ''
      const bName = bVal && typeof bVal === 'object' ? (bVal as Record<string, unknown>).name as string ?? '' : ''
      return aName.localeCompare(bName) * dir
    }
    return ((aVal as number) - (bVal as number)) * dir
  })
})

const paginatedPosts = computed(() => {
  const start = (page.value - 1) * pageSize
  return sortedPosts.value.slice(start, start + pageSize)
})

const columns = [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'author', header: 'Автор' },
  { accessorKey: 'category_title', header: 'Категорія' },
  { accessorKey: 'title', header: 'Заголовок' },
  { accessorKey: 'date_published', header: 'Дата публікації' }
]

function onSortUpdate(newSort: { column: string; direction: 'asc' | 'desc' } | undefined) {
  if (newSort) {
    sort.value = newSort
  } else {
    sort.value = { column: 'id', direction: 'asc' }
  }
  page.value = 1
}

async function fetchPosts() {
  loading.value = true
  error.value = null
  page.value = 1
  try {
    const response = await $fetch('http://localhost/api/blog/posts/')
    posts.value = normalizePosts(response)
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося завантажити публікації.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<template>
  <section class="min-h-screen py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-extrabold leading-tight text-[#1f2a37] dark:text-[#f1f5f9] sm:text-[32px]">
            Управління блогом
          </h1>
          <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Публікації блогу з Nuxt UI Table
          </p>
        </div>
        <NuxtLink
          to="/blog/posts/create"
          class="inline-flex items-center gap-2 rounded-xl bg-[#00dc82] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00c773] hover:shadow-md active:scale-[0.97]"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Нова публікація
        </NuxtLink>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <div class="relative w-full max-w-md">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Пошук за заголовком, витягом або категорією…"
            class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-[#1e293b] dark:text-[#f1f5f9] dark:placeholder-gray-500"
          />
        </div>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-6 py-4"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-red-700 dark:text-red-400">{{ error }}</p>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            @click="fetchPosts"
          >
            Спробувати знову
          </UButton>
        </div>
      </div>

      <UTable
        v-else
        :data="paginatedPosts"
        :columns="columns"
        :loading="loading"
        :sort="sort"
        sortable
        @update:sort="onSortUpdate"
        class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm"
        :ui="{
          root: 'divide-y divide-gray-200 dark:divide-gray-700 min-w-[800px]',
          base: 'w-full',
          thead: 'bg-gray-50/80 dark:bg-gray-800/50',
          th: 'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
          td: 'px-4 py-3 text-sm text-gray-700 dark:text-gray-300'
        }"
      >
        <template #loading>
          <div class="flex items-center justify-center py-24">
            <div class="flex flex-col items-center gap-3">
              <div class="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
              <p class="text-sm text-gray-500">Завантаження публікацій…</p>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="px-4 py-20 text-center">
            <p class="text-sm text-gray-400 dark:text-gray-500">Публікацій не знайдено.</p>
            <NuxtLink
              to="/blog/posts/create"
              class="mt-2 inline-block text-sm font-medium text-[#00dc82] underline decoration-[#00dc82]/30 underline-offset-2 hover:text-[#00c773]"
            >
              Створити першу
            </NuxtLink>
          </div>
        </template>

        <template #author-cell="{ row }">
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ row.original.author?.name || '—' }}
          </span>
        </template>

        <template #category_title-cell="{ row }">
          <span class="inline-block rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
            {{ row.original.category_title || row.original.category_id }}
          </span>
        </template>

        <template #title-cell="{ row }">
          <NuxtLink
            :to="`/blog/posts/${row.original.id}`"
            class="font-medium text-[#1f2a37] dark:text-[#f1f5f9] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#00dc82] hover:decoration-[#00dc82]/30"
          >
            {{ row.original.title }}
          </NuxtLink>
        </template>

        <template #date_published-cell="{ row }">
          <span class="text-gray-500 dark:text-gray-400">
            {{ row.original.date_published || '—' }}
          </span>
        </template>
      </UTable>

      <!-- Pagination -->
      <div
        v-if="filteredPosts.length > 0 && !loading"
        class="mt-4 flex items-center justify-between"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Показано
          <span class="font-semibold text-gray-900 dark:text-[#f1f5f9]">{{ (page - 1) * pageSize + 1 }}</span>–
          <span class="font-semibold text-gray-900 dark:text-[#f1f5f9]">{{ Math.min(page * pageSize, filteredPosts.length) }}</span>
          з
          <span class="font-semibold text-gray-900 dark:text-[#f1f5f9]">{{ filteredPosts.length }}</span>
        </p>

        <UPagination
          v-model:page="page"
          :total="filteredPosts.length"
          :items-per-page="pageSize"
          :sibling-count="2"
          size="sm"
        />
      </div>
    </div>
  </section>
</template>
