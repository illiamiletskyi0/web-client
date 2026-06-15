<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Category } from '~/types/category'

const route = useRoute()

const category = ref<Category | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const notFound = ref(false)

useSeoMeta({
  title: () => category.value ? `${category.value.title} — Категорії` : 'Завантаження…',
  description: () => 'Перегляд категорії блогу'
})

async function fetchCategory() {
  loading.value = true
  error.value = null
  notFound.value = false

  try {
    const raw = await $fetch<unknown>(`http://localhost/api/blog/categories/${route.params.id}`)
    const normalized = normalizeCategory(raw)
    if (!normalized) {
      notFound.value = true
    } else {
      category.value = normalized
    }
  } catch (e: any) {
    if (e?.response?.status === 404) {
      notFound.value = true
    } else {
      error.value = e?.message || 'Не вдалося завантажити категорію.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchCategory)

</script>

<template>    <section class="min-h-screen py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-3xl px-5 sm:px-8 lg:px-10">
      <!-- Back link -->
      <NuxtLink
        to="/categories"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
      >
        <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Назад до списку
      </NuxtLink>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] py-28 shadow-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#00dc82]" />
          <p class="text-sm text-gray-500">Завантаження категорії…</p>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="notFound"
        class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-6 py-16 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gray-100">
          <svg class="size-7 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-700">Категорію не знайдено</p>
        <NuxtLink
          to="/categories"
          class="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00dc82] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00c773]"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          До списку категорій
        </NuxtLink>
      </div>

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
          class="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white dark:bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
          @click="fetchCategory"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Спробувати знову
        </button>
      </div>

      <!-- Category content -->
      <article v-else-if="category" class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 dark:from-gray-800/50 to-white dark:to-[#1e293b] px-6 pb-6 pt-8 sm:px-10 sm:pt-10">
          <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#00dc82]/10 px-3 py-1 text-xs font-medium text-[#00a35d]">
              <span class="size-1.5 rounded-full bg-[#00dc82]" />
              ID: {{ category.id }}
            </span>
            <code class="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{{ category.slug }}</code>
          </div>

          <h1 class="text-2xl font-extrabold leading-tight tracking-tight text-[#1f2a37] dark:text-[#f1f5f9] sm:text-3xl lg:text-4xl">
            {{ category.title }}
          </h1>

          <!-- Parent info -->
          <div v-if="category.parent_title" class="mt-6 flex items-center gap-2 text-sm text-gray-500">
            Батьківська категорія:
            <span class="font-medium text-gray-700">{{ category.parent_title }}</span>
          </div>

          <!-- Description -->
          <div v-if="category.description" class="mt-4 rounded-xl bg-gray-50 px-5 py-4 text-sm text-gray-600 leading-relaxed">
            {{ category.description }}
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-6 py-4 sm:px-10">
          <NuxtLink
            :to="`/categories/edit/${category.id}`"
            class="inline-flex items-center gap-2 rounded-xl bg-[#00dc82] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00c773] hover:shadow-md active:scale-[0.97]"
          >
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Редагувати
          </NuxtLink>
          <NuxtLink
            to="/categories"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Назад до списку
          </NuxtLink>
        </div>
      </article>
    </div>
  </section>
</template>
