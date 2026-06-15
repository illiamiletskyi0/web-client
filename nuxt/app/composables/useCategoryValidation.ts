export type CategoryValidationErrors = Partial<Record<'title' | 'slug' | 'description', string>>

export function toSlug(val: string): string {
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ю': 'yu', 'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'h', 'Ґ': 'g', 'Д': 'd', 'Е': 'e', 'Є': 'ye',
    'Ж': 'zh', 'З': 'z', 'И': 'y', 'І': 'i', 'Ї': 'yi', 'Й': 'y', 'К': 'k', 'Л': 'l',
    'М': 'm', 'Н': 'n', 'О': 'o', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u',
    'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 'Щ': 'shch', 'Ю': 'yu', 'Я': 'ya'
  }
  return val
    .toLowerCase()
    .split('').map(ch => translitMap[ch] || ch).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

export function useCategoryValidation() {
  const validationErrors = ref<CategoryValidationErrors>({})

  function validate(title: string, slug: string, description: string): boolean {
    const errors: CategoryValidationErrors = {}

    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      errors.title = "Назва обов'язкова."
    } else if (trimmedTitle.length < 5) {
      errors.title = 'Назва має містити щонайменше 5 символів.'
    } else if (trimmedTitle.length > 200) {
      errors.title = 'Назва не може перевищувати 200 символів.'
    }

    if (trimmedSlug.length > 200) {
      errors.slug = 'Slug не може перевищувати 200 символів.'
    }

    if (trimmedDescription && trimmedDescription.length < 3) {
      errors.description = 'Опис має містити щонайменше 3 символи.'
    } else if (trimmedDescription.length > 500) {
      errors.description = 'Опис не може перевищувати 500 символів.'
    }

    validationErrors.value = errors
    return Object.keys(errors).length === 0
  }

  return {
    validationErrors,
    validate
  }
}
