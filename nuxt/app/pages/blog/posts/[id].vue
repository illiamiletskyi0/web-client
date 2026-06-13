<script setup lang="ts">
import { ref, onMounted } from 'vue'

const route = useRoute()

interface User {
  id: number
  name: string
}

interface Category {
  id: number
  title: string
  slug: string
  parent_id: number | null
  parent_title: string | null
}

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content_raw: string | null
  content: string | null
  published_at: string | null
  is_published: number
  user: User
  category: Category
  created_at: string
  updated_at: string
}

const post = ref<Post | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

useSeoMeta({
  title: () => post.value ? `${post.value.title} — Блог` : 'Завантаження…',
  description: () => post.value?.excerpt || 'Перегляд публікації'
})

async function fetchPost() {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<{ data: Post }>(`http://localhost/api/blog/posts/${route.params.id}`)
    post.value = {
      ...response.data,
      content: response.data.content_raw
    }
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося завантажити публікацію.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchPost)

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <section class="min-h-screen bg-[#edf1f4] py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-10">
      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-32 shadow-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#00dc82]" />
          <p class="text-sm text-gray-500">Завантаження публікації…</p>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-100">
          <svg class="size-7 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p class="text-sm font-medium text-red-700">{{ error }}</p>
        <button
          class="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          @click="fetchPost"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Спробувати знову
        </button>
      </div>

      <!-- Post content -->
      <article v-else-if="post" class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <!-- Header -->
        <div class="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white px-6 pb-6 pt-8 sm:px-10 sm:pt-10">
          <!-- Meta row -->
          <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <time class="text-gray-500" :datetime="post.published_at || post.created_at">
              {{ formatDate(post.published_at || post.created_at) }}
            </time>

            <span
              v-if="post.is_published"
              class="ml-auto inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700"
            >
              <span class="size-1.5 rounded-full bg-green-500" />
              Опубліковано
            </span>
            <span
              v-else
              class="ml-auto inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700"
            >
              <span class="size-1.5 rounded-full bg-yellow-500" />
              Чернетка
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-2xl font-extrabold leading-tight tracking-tight text-[#1f2a37] sm:text-3xl lg:text-4xl">
            {{ post.title }}
          </h1>

          <!-- Excerpt -->
          <p v-if="post.excerpt" class="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
            {{ post.excerpt }}
          </p>

          <!-- Author & category -->
          <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>{{ post.user.name }}</span>

            <span class="hidden sm:inline text-gray-300">|</span>

            <span class="inline-flex items-center gap-1.5">
              <svg class="size-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M4 7V4h16v3" />
                <path d="M4 11v3h16v-3" />
                <path d="M4 15v5h16v-5" />
              </svg>
              {{ post.category.title }}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-8 sm:px-10 sm:py-10">
          <div
            v-if="post.content"
            class="prose prose-stone max-w-none text-gray-800 leading-relaxed text-[1.0625rem]"
          >
            {{ post.content }}
          </div>
          <p v-else class="text-sm italic text-gray-400">
            Вміст публікації відсутній.
          </p>

          <!-- Footer meta -->
          <div class="mt-10 border-t border-gray-100 pt-6">
            <div class="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
              <span>ID: {{ post.id }}</span>
              <span v-if="post.slug">URL: /{{ post.slug }}</span>
              <span>Створено: {{ formatDate(post.created_at) }}</span>
              <span v-if="post.updated_at !== post.created_at">Оновлено: {{ formatDate(post.updated_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation footer -->
        <div class="border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:px-10">
          <a
            href="/blog-posts"
            class="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Назад до списку
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
