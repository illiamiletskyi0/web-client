<script setup lang="ts">
const { plans, billingCycle, pending, error } = usePricingPlans()

useSeoMeta({
  title: 'Pricing Plans',
  description: 'Choose the plan that fits your team and workflow.'
})
</script>

<template>
  <section class="bg-[#edf1f4] py-10 sm:py-12 lg:py-14">
    <div class="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-[26px] font-extrabold leading-tight text-[#1f2a37] sm:text-[32px]">
          Start Your 3 Day Free Trial
        </h1>

        <PricingBillingToggle v-model="billingCycle" />
      </div>

      <div class="grid gap-5 lg:grid-cols-3">
        <p
          v-if="pending"
          class="col-span-full rounded-lg border border-[#d7dde4] bg-white p-4 text-[#4a5968]"
        >
          Loading pricing plans...
        </p>

        <p
          v-else-if="error"
          class="col-span-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          Failed to load pricing plans.
        </p>

        <template v-else>
          <PricingPlanCard
            v-for="plan in plans"
            :key="plan.id"
            :plan="plan"
            :cycle="billingCycle"
          />
        </template>
      </div>
    </div>
  </section>
</template>
