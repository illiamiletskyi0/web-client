<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { Category } from '~/types/category'
import { toSlug } from '~/composables/useCategoryValidation'

useSeoMeta({
  title: 'Створення категорії',
  description: 'Створення нової категорії блогу.'
})

const router = useRouter()

const schema = z.object({
  title: z.string()
    .min(5, 'Назва має містити щонайменше 5 символів.')
    .max(200, 'Назва не може перевищувати 200 символів.'),
  slug: z.string()
    .max(200, 'Slug не може перевищувати 200 символів.')
    .optional()
    .default(''),
  description: z.string()
    .min(3, 'Опис має містити щонайменше 3 символи.')
    .max(500, 'Опис не може перевищувати 500 символів.')
    .optional()
    .default(''),
  parentId: z.number().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  title: '',
  slug: '',
  description: '',
  parentId: undefined
})

const categories = ref<Category[]>([])
const saving = ref(false)
const error = ref<string | null>(null)
const autoGenerateSlug = ref(true)

watch(() => state.title, (val) => {
  if (autoGenerateSlug.value) {
    state.slug = toSlug(val)
  }
})

const parentItems = computed(() =>
  categories.value.map(cat => ({ label: cat.title, value: cat.id }))
)

async function loadCategories() {
  try {
    const all = await fetchAllPaginated<Category>('http://localhost/api/blog/categories/')
    categories.value = all
  } catch {
    // Non-critical, parent field will just be empty
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  error.value = null

  const data = event.data
  const finalSlug = data.slug?.trim() || toSlug(data.title.trim())

  try {
    const body: Record<string, unknown> = {
      title: data.title.trim(),
      slug: finalSlug,
      parent_id: data.parentId ?? null
    }
    if (data.description?.trim()) {
      body.description = data.description.trim()
    }
    const createdRaw = await $fetch<unknown>('http://localhost/api/admin/blog/categories', {
      method: 'POST',
      body
    })
    const created = normalizeCategory(createdRaw)
    if (created) {
      await router.push(`/categories/${created.id}`)
    } else if (isSuccessResponse(createdRaw)) {
      await router.push('/categories')
    } else {
      error.value = 'Не вдалося створити категорію.'
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Не вдалося створити категорію.'
  } finally {
    saving.value = false
  }
}

onMounted(loadCategories)
</script>

<template>    <section class="min-h-screen py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-2xl px-5 sm:px-8 lg:px-10">
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

      <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-b from-gray-50 dark:from-gray-800/50 to-white dark:to-[#1e293b] px-6 pb-5 pt-7 sm:px-10">
          <h1 class="text-[26px] font-extrabold leading-tight text-[#1f2a37] dark:text-[#f1f5f9] sm:text-[30px]">
            Створити категорію
          </h1>
          <p class="mt-1 text-sm text-gray-500">Додайте нову категорію для публікацій блогу</p>
        </div>

        <!-- Error banner -->
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          icon="i-lucide-circle-x"
          title="Помилка"
          :description="error"
          close
          class="mx-6 mt-6 sm:mx-10"
          @update:open="() => error = null"
        />

        <!-- Form -->
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-6 px-6 py-6 sm:px-10"
          @submit="onSubmit"
        >
          <!-- Title -->
          <UFormField
            label="Назва"
            name="title"
            required
            help="Від 5 до 200 символів."
          >
            <UInput
              v-model="state.title"
              placeholder="Наприклад: Новини, Технології…"
            />
          </UFormField>

          <!-- Slug -->
          <UFormField
            label="Slug"
            name="slug"
            :help="'URL-ідентифікатор. Наприклад: /categories/news'"
          >
            <div class="flex items-center gap-2">
              <UInput
                v-model="state.slug"
                :disabled="autoGenerateSlug"
                placeholder="news, technology…"
                class="flex-1"
              />
              <label class="flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-400">
                <input
                  type="checkbox"
                  v-model="autoGenerateSlug"
                  class="rounded border-gray-300 text-[#00dc82] focus:ring-[#00dc82]/30"
                />
                Авто
              </label>
            </div>
          </UFormField>

          <!-- Description -->
          <UFormField
            label="Опис"
            name="description"
            help="Необов'язково. Від 3 до 500 символів."
          >
            <UTextarea
              v-model="state.description"
              placeholder="Короткий опис категорії…"
              :rows="3"
            />
            <p
              v-if="state.description"
              class="mt-1 text-right text-xs text-gray-400"
            >
              {{ state.description.length }} / 500
            </p>
          </UFormField>

          <!-- Parent category -->
          <UFormField
            label="Батьківська категорія"
            name="parentId"
            help="Необов'язково. Виберіть, якщо ця категорія є підкатегорією."
          >
            <USelect
              v-model="state.parentId"
              :items="parentItems"
              placeholder="— Без батьківської категорії —"
            />
          </UFormField>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <UButton
              variant="outline"
              color="neutral"
              to="/categories"
            >
              Скасувати
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
              :disabled="saving"
              icon="i-lucide-plus"
            >
              {{ saving ? 'Створення…' : 'Створити категорію' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </section>
</template>
