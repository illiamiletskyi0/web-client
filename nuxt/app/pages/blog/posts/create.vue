<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { toSlug } from '~/composables/useCategoryValidation'
import type { Category } from '~/types/category'
import { normalizePost } from '~/utils/normalizePost'
import { fetchAllPaginated } from '~/utils/fetchAllPaginated'

useSeoMeta({
  title: 'Створення публікації',
  description: 'Створення нової публікації блогу.'
})

const router = useRouter()

const schema = z.object({
  title: z.string()
    .min(5, 'Заголовок має містити щонайменше 5 символів.')
    .max(200, 'Заголовок не може перевищувати 200 символів.'),
  slug: z.string()
    .max(200, 'Slug не може перевищувати 200 символів.')
    .optional()
    .default(''),
  content_raw: z.string()
    .min(5, 'Вміст має містити щонайменше 5 символів.')
    .max(10000, 'Вміст не може перевищувати 10000 символів.'),
  is_published: z.boolean().default(false),
  date_published: z.string().optional().default(''),
  category_id: z.number()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  title: '',
  slug: '',
  content_raw: '',
  is_published: false,
  date_published: '',
  category_id: undefined as unknown as number
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

const categoryItems = computed(() =>
  categories.value.map(cat => ({ label: cat.title, value: cat.id }))
)

async function loadCategories() {
  try {
    const all = await fetchAllPaginated<Category>('http://localhost/api/blog/categories/')
    categories.value = all
  } catch {
    // Non-critical
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  error.value = null

  const data = event.data
  const finalSlug = data.slug?.trim() || toSlug(data.title.trim())

  try {
    const createdRaw = await $fetch('http://localhost/api/admin/blog/posts', {
      method: 'POST',
      body: {
        title: data.title.trim(),
        slug: finalSlug,
        content_raw: data.content_raw,
        is_published: data.is_published,
        date_published: data.date_published?.trim() || null,
        category_id: data.category_id
      }
    })
    // Request succeeded — post was created. Try to redirect to the new post
    const created = normalizePost(createdRaw)
    if (created?.id) {
      await router.push(`/blog/posts/${created.id}`)
    } else {
      await router.push('/blogposts')
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Не вдалося створити публікацію.'
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
        to="/blogposts"
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
            Створити публікацію
          </h1>
          <p class="mt-1 text-sm text-gray-500">Додайте нову статтю до блогу</p>
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
            label="Заголовок"
            name="title"
            required
            help="Від 5 до 200 символів."
          >
            <UInput
              v-model="state.title"
              placeholder="Наприклад: Як використовувати Nuxt UI…"
            />
          </UFormField>

          <!-- Slug -->
          <UFormField
            label="Slug"
            name="slug"
            help="URL-ідентифікатор публікації. До 200 символів."
          >
            <div class="flex items-center gap-2">
              <UInput
                v-model="state.slug"
                :disabled="autoGenerateSlug"
                placeholder="yak-vykorystovuvaty-nuxt-ui"
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

          <!-- Category -->
          <UFormField
            label="Категорія"
            name="category_id"
            required
            help="Виберіть категорію для публікації"
          >
            <USelect
              v-model="state.category_id"
              :items="categoryItems"
              placeholder="— Виберіть категорію —"
            />
          </UFormField>

          <!-- Content -->
          <UFormField
            label="Вміст"
            name="content_raw"
            required
            help="Основний текст публікації. Від 5 до 10000 символів."
          >
            <UTextarea
              v-model="state.content_raw"
              placeholder="Текст публікації…"
              :rows="10"
            />
            <p
              v-if="state.content_raw"
              class="mt-1 text-right text-xs text-gray-400"
            >
              {{ state.content_raw.length }} / 10000
            </p>
          </UFormField>

          <!-- Published -->
          <UFormField
            label="Статус публікації"
            name="is_published"
          >
            <div class="flex items-center gap-3">
              <USwitch v-model="state.is_published" />
              <span class="text-sm text-gray-600">
                {{ state.is_published ? 'Опубліковано' : 'Чернетка' }}
              </span>
            </div>
          </UFormField>

          <!-- Date published -->
          <UFormField
            v-if="state.is_published"
            label="Дата публікації"
            name="date_published"
            help="Залиште порожнім, щоб використати поточну дату."
          >
            <UInput
              v-model="state.date_published"
              type="datetime-local"
            />
          </UFormField>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <UButton
              variant="outline"
              color="neutral"
              to="/blogposts"
            >
              Скасувати
            </UButton>
            <UButton
              type="submit"
              :loading="saving"
              :disabled="saving"
              icon="i-lucide-plus"
            >
              {{ saving ? 'Створення…' : 'Створити публікацію' }}
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </section>
</template>
