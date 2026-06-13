<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  is_published: number
  user_id: number
  category_id: number
  created_at: string
  updated_at: string
}

const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const page = ref(1)
const pageSize = 10

const paginatedPosts = computed(() => {
  const start = (page.value - 1) * pageSize
  return posts.value.slice(start, start + pageSize)
})

async function getPosts() {
  loading.value = true
  error.value = null
  page.value = 1

  try {
    const data = await $fetch<Post[]>('http://localhost/api/blog/posts/')
    posts.value = data
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося завантажити публікації.'
  } finally {
    loading.value = false
  }
}

onMounted(() => getPosts())
</script>

<template>
  <div class="container mx-auto">
    <div class="flex justify-center">
      <div class="w-full">
        <div class="mb-4 rounded-lg bg-gray-100 px-4 py-3">
          <h2 class="text-lg font-bold text-gray-900">Публікації</h2>
        </div>

        <div v-if="loading" class="flex items-center justify-center rounded-lg border bg-white py-20">
          <div class="flex flex-col items-center gap-3">
            <div class="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            <p class="text-sm text-gray-500">Завантаження публікацій…</p>
          </div>
        </div>

        <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
          <p class="text-sm font-medium text-red-700">{{ error }}</p>
          <button
            class="mt-4 rounded-lg border px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
            @click="getPosts"
          >
            Спробувати знову
          </button>
        </div>

        <div v-else class="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full table-auto text-left">
              <thead>
                <tr class="border-b bg-gray-50">
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Автор</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Категорія</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Заголовок</th>
                  <th class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Дата публікації</th>
                </tr>
              </thead>

          <tbody>
            <tr v-if="paginatedPosts.length === 0">
              <td colspan="5" class="px-4 py-20 text-center text-sm text-gray-400">
                Публікацій не знайдено.
              </td>
            </tr>

            <tr
              v-for="post in paginatedPosts"
              :key="post.id"
              class="border-b transition-colors hover:bg-blue-50/40"
            >
              <td class="px-4 py-3 text-sm text-gray-500">{{ post.id }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ post.user_id }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ post.category_id }}</td>
              <td class="px-4 py-3 text-sm font-medium">
                <a
                  :href="'/blog/posts/' + post.id"
                  class="text-[#00dc82] underline decoration-[#00dc82]/30 underline-offset-2 transition-colors hover:text-[#00c773]"
                >
                  {{ post.title }}
                </a>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">{{ post.published_at || '—' }}</td>
            </tr>
          </tbody>
            </table>
          </div>

          <div
            v-if="posts.length > 0"
            class="border-t border-gray-200 bg-gray-50/50 px-4 py-3"
          >
            <TableDataTablePagination
              :current-page="page"
              :total-pages="Math.max(1, Math.ceil(posts.length / pageSize))"
              :total-items="posts.length"
              :page-size="pageSize"
              @update:current-page="page = $event"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
