<script setup lang="ts">
const model = defineModel<string>({ default: '' })
</script>

<template>
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
      v-model="model"
      type="text"
      placeholder="Search by title, description, brand, or category…"
      class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    />
  </div>
</template>
