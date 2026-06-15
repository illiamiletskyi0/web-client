<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Category } from '~/types/category'

type SortField = 'id' | 'title' | 'slug' | 'parent_title'
type SortDirection = 'asc' | 'desc'

useSeoMeta({
  title: 'Категорії — Управління',
  description: 'Управління категоріями блогу.'
})

const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleteLoading = ref<number | null>(null)
const showDeleteModal = ref(false)
const categoryToDelete = ref<Category | null>(null)

const page = ref(1)
const pageSize = 10
const searchQuery = ref('')
const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('asc')

const filteredCategories = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return categories.value
  return categories.value.filter(c =>
    c.title.toLowerCase().includes(query)
    || c.slug.toLowerCase().includes(query)
    || (c.parent_title && c.parent_title.toLowerCase().includes(query))
  )
})

const sortedCategories = computed(() => {
  const items = [...filteredCategories.value]
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

const paginatedCategories = computed(() => {
  const start = (page.value - 1) * pageSize
  return sortedCategories.value.slice(start, start + pageSize)
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

watch(searchQuery, () => {
  page.value = 1
})

function sortIcon(field: SortField): string {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

async function fetchCategories() {
  loading.value = true
  error.value = null
  page.value = 1
  try {
    const all = await fetchAllPaginated<Category>('http://localhost/api/blog/categories/')
    categories.value = all
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося завантажити категорії.'
  } finally {
    loading.value = false
  }
}

async function confirmDelete(category: Category) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!categoryToDelete.value) return

  const id = categoryToDelete.value.id
  deleteLoading.value = id
  try {
    await $fetch(`http://localhost/api/admin/blog/categories/${id}`, {
      method: 'DELETE'
    })
    categories.value = categories.value.filter(c => c.id !== id)
    showDeleteModal.value = false
    categoryToDelete.value = null
  } catch (e: any) {
    error.value = e?.message || 'Не вдалося видалити категорію.'
  } finally {
    deleteLoading.value = null
  }
}

function getDropdownItems(category: Category) {
  return [[
    {
      label: 'Переглянути',
      icon: 'i-lucide-eye',
      to: `/categories/${category.id}`
    },
    {
      label: 'Редагувати',
      icon: 'i-lucide-pencil',
      to: `/categories/edit/${category.id}`
    },
    {
      label: 'Видалити',
      icon: 'i-lucide-trash-2',
      onSelect: () => confirmDelete(category)
    }
  ]]
}

onMounted(fetchCategories)
</script>

<template>
  <section class="min-h-screen py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-[26px] font-extrabold leading-tight text-[#1f2a37] dark:text-[#f1f5f9] sm:text-[32px]">
            Категорії
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            Управління категоріями блогу
          </p>
        </div>
        <NuxtLink
          to="/categories/create"
          class="inline-flex items-center gap-2 rounded-xl bg-[#00dc82] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#00c773] hover:shadow-md active:scale-[0.97]"
        >
          <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Створити категорію
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
            placeholder="Пошук за назвою, slug або батьківською категорією…"
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
            class="rounded-lg border border-red-200 bg-white dark:bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
            @click="fetchCategories"
          >
            Спробувати знову
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div
        v-if="loading"
        class="flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] py-32 shadow-sm"
      >
        <div class="flex flex-col items-center gap-4">
          <div class="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#00dc82]" />
          <p class="text-sm text-gray-500">Завантаження категорій…</p>
        </div>
      </div>

      <!-- Table -->
      <div
        v-else-if="!error"
        class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full table-auto text-left">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50">
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('id')">
                ID <span class="text-[10px]" :class="sortField === 'id' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('id') }}</span>
              </th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('title')">
                Назва <span class="text-[10px]" :class="sortField === 'title' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('title') }}</span>
              </th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('slug')">
                Slug <span class="text-[10px]" :class="sortField === 'slug' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('slug') }}</span>
              </th>
              <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 cursor-pointer select-none transition-colors hover:text-gray-900" @click="toggleSort('parent_title')">
                Батьківська <span class="text-[10px]" :class="sortField === 'parent_title' ? 'text-gray-900' : 'text-gray-300'">{{ sortIcon('parent_title') }}</span>
              </th>
                <th class="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="paginatedCategories.length === 0">
                <td colspan="5" class="px-5 py-20 text-center text-sm text-gray-400">
                  Категорій не знайдено.
                  <NuxtLink
                    to="/categories/create"
                    class="ml-1 font-medium text-[#00dc82] underline decoration-[#00dc82]/30 underline-offset-2 hover:text-[#00c773]"
                  >
                    Створити першу
                  </NuxtLink>
                </td>
              </tr>
              <tr
                v-for="category in paginatedCategories"
                :key="category.id"
                class="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
              >
                <td class="px-5 py-4 text-sm text-gray-500">{{ category.id }}</td>
                <td class="px-5 py-4">
                  <NuxtLink
                    :to="`/categories/${category.id}`"
                    class="font-medium text-[#1f2a37] dark:text-[#f1f5f9] underline decoration-transparent underline-offset-2 transition-colors hover:text-[#00dc82] hover:decoration-[#00dc82]/30"
                  >
                    {{ category.title }}
                  </NuxtLink>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500">
                  <code class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{{ category.slug }}</code>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500">
                  <span v-if="category.parent_title" class="font-medium text-gray-600">
                    {{ category.parent_title }}
                  </span>
                  <span v-else class="text-gray-300">—</span>
                </td>
                <td class="px-5 py-4">
                  <UDropdownMenu :items="getDropdownItems(category)">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-ellipsis-vertical"
                      size="sm"
                    />
                  </UDropdownMenu>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredCategories.length > 0"
          class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 px-5 py-3"
        >
          <p class="text-sm text-gray-500">
            Показано
            <span class="font-semibold text-gray-900">{{ (page - 1) * pageSize + 1 }}</span>–
            <span class="font-semibold text-gray-900">{{ Math.min(page * pageSize, filteredCategories.length) }}</span>
            з
            <span class="font-semibold text-gray-900">{{ filteredCategories.length }}</span>
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
            <span class="px-3 text-xs font-medium text-gray-500">{{ page }} / {{ Math.max(1, Math.ceil(filteredCategories.length / pageSize)) }}</span>
            <button
              class="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="page * pageSize >= filteredCategories.length"
              @click="page = page + 1"
            >
              <svg class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirmation modal -->
      <Teleport to="body">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click.self="showDeleteModal = false"
        >
          <div class="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] p-6 shadow-xl">
            <div class="flex items-center gap-3">
              <div class="flex size-12 items-center justify-center rounded-full bg-red-100">
                <svg class="size-6 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-[#1f2a37] dark:text-[#f1f5f9]">Видалити категорію</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Ви впевнені, що хочете видалити <strong class="text-gray-700">{{ categoryToDelete?.title }}</strong>?
                </p>
              </div>
            </div>
            <p class="mt-3 rounded-lg bg-yellow-50 px-4 py-2.5 text-xs text-yellow-700">
              Ця дія незворотна. Дочірні категорії втратять зв'язок з батьківською.
            </p>
            <div class="mt-6 flex items-center justify-end gap-3">
              <button
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                @click="showDeleteModal = false"
              >
                Скасувати
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="deleteLoading !== null"
                @click="handleDelete"
              >
                <svg
                  v-if="deleteLoading === categoryToDelete?.id"
                  class="size-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="size-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {{ deleteLoading === categoryToDelete?.id ? 'Видалення…' : 'Так, видалити' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </section>
</template>
