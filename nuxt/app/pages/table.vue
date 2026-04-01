<script setup lang="ts">
useSeoMeta({
  title: 'Products Table',
  description: 'Browse, search, and sort products with pagination.'
})
</script>

<template>
  <section class="min-h-screen bg-[#edf1f4] py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
      <h1 class="mb-6 text-[26px] font-extrabold leading-tight text-[#1f2a37] sm:text-[32px]">
        Products
      </h1>

      <TableDataTable />
    </div>
  </section>
</template>
