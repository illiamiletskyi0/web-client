<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <tr class="border-b border-gray-100 transition-colors hover:bg-blue-50/40">
    <td class="px-4 py-3">
      <img
        :src="product.thumbnail"
        :alt="product.title"
        class="h-[100px] w-[100px] rounded-lg object-cover"
        loading="lazy"
      />
    </td>
    <td class="px-4 py-3 text-sm font-medium text-gray-900">
      {{ product.title }}
    </td>
    <td class="max-w-[260px] px-4 py-3 text-sm text-gray-500">
      <span class="line-clamp-2">{{ product.description }}</span>
    </td>
    <td class="px-4 py-3 text-sm font-semibold text-gray-900">
      ${{ product.price.toFixed(2) }}
    </td>
    <td
      class="px-4 py-3 text-sm font-semibold"
      :class="product.rating >= 4.5 ? 'text-green-500' : 'text-red-500'"
    >
      {{ product.rating.toFixed(2) }}
    </td>
    <td class="px-4 py-3 text-sm text-gray-700">
      {{ product.brand || '—' }}
    </td>
    <td class="px-4 py-3">
      <span class="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
        {{ product.category }}
      </span>
    </td>
  </tr>
</template>
