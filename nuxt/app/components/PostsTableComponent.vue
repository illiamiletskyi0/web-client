<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Post } from '~/types/post'
import { normalizePosts } from '~/utils/normalizePost'

type SortField = 'id' | 'title' | 'author' | 'category_title' | 'date_published'
type SortDirection = 'asc' | 'desc'

const router = useRouter()

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const page = ref(1)
const pageSize = 10
const searchQuery = ref('')

watch(searchQuery, () => {
  page.value = 1
})
const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('asc')

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

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  page.value = 1
}

function sortIcon(field: SortField): string {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

async function getPosts() {
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

async function confirmDelete(id: number, title: string) {
  if (confirm(`Ви впевнені, що хочете видалити публікацію "${title}"?`)) {
    try {
      await $fetch(`http://localhost/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
      });
      
      // Refresh the posts list after successful deletion
      getPosts();
    } catch (e: any) {
      error.value = e?.message || 'Не вдалося видалити публікацію.';
    }
  }
}

onMounted(() => getPosts())
</script>

<template>
  <div>
    <!-- Header with create button -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-gray-900">Публікації</h2>
        <p class="mt-0.5 text-sm text-gray-500">Управління статтями блогу</p>
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
      class="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-red-700">{{ error }}</p>
        <button
          class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
          @click="getPosts"
        >
          Спробувати знову
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] py-32 shadow-sm"
    >
      <div class="flex flex-col items-center gap-4">
        <div class="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#00dc82]" />
        <p class="text-sm text-gray-500">Завантаження публікацій…</p>
      </div>
    </div>

    <!-- Table -->
    <div
      v-else-if="!error"
      class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full table-auto text-left">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('id')">
                # <span class="text-[10px]" :class="sortField === 'id' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('id') }}</span>
              </th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('author')">
                Автор <span class="text-[10px]" :class="sortField === 'author' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('author') }}</span>
              </th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('category_title')">
                Категорія <span class="text-[10px]" :class="sortField === 'category_title' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('category_title') }}</span>
              </th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('title')">
                Заголовок <span class="text-[10px]" :class="sortField === 'title' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('title') }}</span>
              </th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('date_published')">
                Дата публікації <span class="text-[10px]" :class="sortField === 'date_published' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('date_published') }}</span>
              </th>
              <th class="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginatedPosts.length === 0">
              <td colspan="6" class="px-4 py-20 text-center text-sm text-gray-400">
                Публікацій не знайдено.
                <NuxtLink
                  to="/blog/posts/create"
                  class="ml-1 font-medium text-[#00dc82] underline decoration-[#00dc82]/30 underline-offset-2 hover:text-[#00c773]"
                >
                  Створити першу
                </NuxtLink>
              </td>
            </tr>

            <tr
              v-for="post in paginatedPosts"
              :key="post.id"
              class="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
            >
              <td class="px-4 py-3.5 text-sm text-gray-500">{{ post.id }}</td>
              <td class="px-4 py-3.5 text-sm text-gray-700">{{ post.author?.name || '—' }}</td>
              <td class="px-4 py-3.5 text-sm text-gray-700">{{ post.category_title || post.category_id }}</td>
              <td class="px-4 py-3.5 text-sm font-medium">
                <NuxtLink
                  :to="`/blog/posts/${post.id}`"
                  class="text-[#1f2a37] dark:text-[#f1f5f9] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#00dc82] hover:decoration-[#00dc82]/30"
                >
                  {{ post.title }}
                </NuxtLink>
              </td>
              <td class="px-4 py-3.5 text-sm text-gray-500">{{ post.date_published || '—' }}</td>
              <td class="px-4 py-3.5 text-sm">
                <UDropdownMenu 
                  placement="bottom-end" 
                  :items="[
                    [
                      {
                        label: 'Редагувати',
                        icon: 'i-lucide-edit',
                        onSelect: () => router.push(`/blog/posts/edit/${post.id}`)
                      },
                      {
                        label: 'Видалити',
                        icon: 'i-lucide-trash-2',
                        onSelect: () => confirmDelete(post.id, post.title)
                      }
                    ]
                  ]"
                >
                  <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-down" />
                </UDropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredPosts.length > 0"
        class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-4 py-3"
      >
        <p class="text-sm text-gray-500">
          Показано
          <span class="font-semibold text-gray-900">{{ (page - 1) * pageSize + 1 }}</span>–
          <span class="font-semibold text-gray-900">{{ Math.min(page * pageSize, filteredPosts.length) }}</span>
          з
          <span class="font-semibold text-gray-900">{{ filteredPosts.length }}</span>
        </p>
        <div class="flex items-center gap-1.5">
          <button
            class="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            @click="page = page - 1"
          >
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="px-3 text-xs font-medium text-gray-500">{{ page }} / {{ Math.max(1, Math.ceil(filteredPosts.length / pageSize)) }}</span>
          <button
            class="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page * pageSize >= filteredPosts.length"
            @click="page = page + 1"
          >
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
