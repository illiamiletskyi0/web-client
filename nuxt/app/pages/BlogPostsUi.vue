<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

useSeoMeta({
  title: 'Блог — Публікації (UI)',
  description: 'Управління публікаціями блогу з використанням Nuxt UI Table.'
})

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

const columns = [
  { accessorKey: 'id', header: '#' },
  { accessorKey: 'user_id', header: 'Автор' },
  { accessorKey: 'category_id', header: 'Категорія' },
  { accessorKey: 'title', header: 'Заголовок' },
  { accessorKey: 'is_published', header: 'Статус' },
  { accessorKey: 'published_at', header: 'Дата публікації' }
]

async function fetchPosts() {
  loading.value = true
  error.value = null
  page.value = 1
  try {
    posts.value = await $fetch<Post[]>('http://localhost/api/blog/posts/')
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося завантажити публікації.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPosts)
</script>

<template>
  <section class="min-h-screen bg-[#edf1f4] py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-[26px] font-extrabold leading-tight text-[#1f2a37] sm:text-[32px]">
          Управління блогом
        </h1>

        <a
          href="/admin/blog/posts/create"
          class="inline-flex items-center gap-1.5 rounded-lg bg-[#00dc82] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#00c773]"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Додати
        </a>
      </div>

      <div
        v-if="error"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center"
      >
        <p class="text-sm font-medium text-red-700">
          {{ error }}
        </p>
        <UButton
          size="sm"
          color="neutral"
          variant="outline"
          class="mt-4"
          @click="fetchPosts"
        >
          Спробувати знову
        </UButton>
      </div>

      <UTable
        v-else
        :data="paginatedPosts"
        :columns="columns"
        :loading="loading"
        class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        :ui="{
          root: 'divide-y divide-gray-200 min-w-[700px]',
          base: 'w-full',
          thead: 'bg-gray-50/80',
          th: 'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
          td: 'px-4 py-3 text-sm'
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
            <p class="text-sm text-gray-400">Публікацій не знайдено.</p>
          </div>
        </template>

        <template #is_published-cell="{ row }">
          <span
            v-if="row.original.is_published"
            class="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          >
            Опубліковано
          </span>
          <span
            v-else
            class="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700"
          >
            Чернетка
          </span>
        </template>

        <template #category_id-cell="{ row }">
          <span class="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
            {{ row.original.category_id }}
          </span>
        </template>

        <template #title-cell="{ row }">
          <a
            :href="'/admin/blog/posts/' + row.original.id + '/edit'"
            class="font-medium text-[#00dc82] underline decoration-[#00dc82]/30 underline-offset-2 transition-colors hover:text-[#00c773]"
          >
            {{ row.original.title }}
          </a>
        </template>

        <template #published_at-cell="{ row }">
          <span class="text-gray-500">
            {{ row.original.published_at || '—' }}
          </span>
        </template>
      </UTable>

      <div
        v-if="posts.length > 0 && !loading"
        class="mt-4 flex items-center justify-between"
      >
        <p class="text-sm text-gray-500">
          Showing
          <span class="font-semibold text-gray-900">{{ (page - 1) * pageSize + 1 }}</span>–<span class="font-semibold text-gray-900">{{ Math.min(page * pageSize, posts.length) }}</span>
          of
          <span class="font-semibold text-gray-900">{{ posts.length }}</span>
          results
        </p>

        <UPagination
          v-model:page="page"
          :total="posts.length"
          :items-per-page="pageSize"
          :sibling-count="2"
          size="sm"
        />
      </div>
    </div>
  </section>
</template>
