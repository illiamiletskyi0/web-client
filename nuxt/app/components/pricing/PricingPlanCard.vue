<script setup lang="ts">
import { computed } from 'vue'
import type { BillingCycle, PricingPlan } from '~/composables/usePricingPlans'

const props = defineProps<{
  plan: PricingPlan 
  cycle: BillingCycle
}>()

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value)
}

const displayPrice = computed(() => {
  return props.cycle === 'annual' ? props.plan.annual.monthlyEquivalent : props.plan.monthlyPrice
})

const billedText = computed(() => {
  if (props.cycle === 'annual') {
    return {
      prefix: 'billed yearly at ',
      current: `$${formatMoney(props.plan.annual.billedYearly)}`,
      previous: `$${formatMoney(props.plan.annual.originalYearly)}`,
      showPrevious: true
    }
  }

  return {
    prefix: 'billed monthly at ',
    current: `$${formatMoney(props.plan.monthlyPrice)}`,
    previous: '',
    showPrevious: false
  }
})

const savingsLabel = computed(() => {
  if (props.cycle !== 'annual') {
    return ''
  }

  return `$${formatMoney(props.plan.annual.savings)} in savings`
})
</script>

<template>
  <article
    class="rounded-[8px] border border-[#d7dde4] bg-[#f8fafc] px-6 py-10 shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
  >
    <div class="-mx-6 -mt-10 mb-8 h-1 rounded-t-[8px] bg-linear-to-r from-[#58d62d] to-[#17c0d6]" />

    <h2 class="text-xl font-bold leading-tight text-[#1e2733]">
      {{ plan.name }} - {{ cycle === 'annual' ? 'Annual' : 'Monthly' }}
    </h2>

    <p class="mt-4 inline-block rounded bg-[#e7ebef] px-2 py-0.5 text-xs font-semibold text-[#606d7b]">
      {{ cycle === 'annual' ? '3-days free then:' : 'Then:' }}
    </p>

    <div class="mt-4 flex items-end gap-1 leading-none">
      <span class="text-3xl font-extrabold tracking-[-0.015em] text-[#1f2a37]">${{ formatMoney(displayPrice) }}</span>
      <span class="pb-0.5 text-base font-medium text-[#5f6c7b]">/month</span>
    </div>

    <p class="mt-4 text-sm text-[#4a5968]">
      <span>{{ billedText.prefix }}</span>
      <span
        v-if="billedText.showPrevious"
        class="line-through text-[#7e8895]"
      >
        {{ billedText.previous }}
      </span>
      <span class="font-semibold text-[#2f3f50]"> {{ billedText.current }}</span>
    </p>

    <p
      v-if="savingsLabel"
      class="mt-4 inline-block rounded bg-[#d7dde4] px-2 py-0.5 text-sm font-semibold leading-none text-[#1e8f45]"
    >
      {{ savingsLabel }}
    </p>

    <UButton
      label="Try It Free"
      color="warning"
      text-color="black"
      block
      size="xl"
      class="mt-8 h-12 rounded-[6px] text-base font-bold text-black"
      :ui="{
        base: 'justify-center tracking-tight',
        leadingIcon: 'hidden',
        trailingIcon: 'hidden'
      }"
    />

    <USeparator class="my-6" />

    <ul class="space-y-4">
      <li
        v-for="perk in plan.perks"
        :key="perk.main"
        class="flex items-start gap-2.5"
      >
        <UIcon
          name="i-lucide-sparkles"
          class="mt-0.5 size-4 shrink-0 text-[#7ed957]"
        />

        <div>
          <p class="text-sm font-semibold leading-snug text-[#1f2a37]">
            <template v-if="perk.lead">
              <strong class="font-extrabold">{{ perk.lead }}</strong>{{ perk.rest }}
            </template>
            <template v-else>
              {{ perk.main }}
            </template>
          </p>

          <p
            v-if="perk.detail"
            class="mt-0.5 text-xs leading-snug text-[#5f6f80]"
          >
            {{ perk.detail }}
          </p>
        </div>
      </li>
    </ul>
  </article>
</template>
