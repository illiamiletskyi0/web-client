import { defineStore } from 'pinia'

export interface SelectedSubscription {
  id: string
  name: string
  cycle: BillingCycle
  monthlyDisplay: number
  price: number
  label: string
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const selectedSubscription = ref<SelectedSubscription | null>(null)

  const hasSubscription = computed(() => selectedSubscription.value !== null)

  function setSelectedSubscription(subscription: SelectedSubscription) {
    selectedSubscription.value = subscription
  }

  function clearSelectedSubscription() {
    selectedSubscription.value = null
  }

  return {
    selectedSubscription,
    hasSubscription,
    setSelectedSubscription,
    clearSelectedSubscription
  }
})