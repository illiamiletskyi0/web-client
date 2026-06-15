<script setup lang="ts">
useSeoMeta({
  title: 'Блог — Публікації',
  description: 'Управління публікаціями блогу.'
})
</script>

<template>
  <section class="min-h-screen py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-10">
      <h1 class="mb-8 text-[26px] font-extrabold leading-tight text-[#1f2a37] dark:text-[#f1f5f9] sm:text-[32px]">
        Управління блогом
      </h1>

      <PostsTableComponent />
    </div>
  </section>
</template>