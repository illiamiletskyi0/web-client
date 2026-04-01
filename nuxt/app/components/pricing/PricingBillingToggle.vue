<script setup lang="ts">
import type { BillingCycle } from '~/composables/usePricingPlans'

const props = defineProps<{
  modelValue: BillingCycle
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BillingCycle]
}>()

const setCycle = (value: BillingCycle) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="flex items-center justify-end gap-2">
    <p class="text-sm font-semibold text-[#1f9f58] whitespace-nowrap">
      Save up to 20%
      <UIcon
        name="i-lucide-corner-up-right"
        class="size-4 align-top -ml-0.5"
      />
    </p>

    <div class="inline-flex overflow-hidden rounded-md border border-[#d5dce3] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <button
        type="button"
        class="px-4 py-1.5 text-[18px] font-semibold leading-none transition-colors"
        :class="props.modelValue === 'annual' ? 'bg-white text-[#222d39]' : 'bg-[#eef2f5] text-[#4d5967]'"
        @click="setCycle('annual')"
      >
        Annual
      </button>

      <button
        type="button"
        class="px-4 py-1.5 text-[18px] font-semibold leading-none transition-colors"
        :class="props.modelValue === 'monthly' ? 'bg-white text-[#222d39]' : 'bg-[#eef2f5] text-[#4d5967]'"
        @click="setCycle('monthly')"
      >
        Monthly
      </button>
    </div>
  </div>
</template>
