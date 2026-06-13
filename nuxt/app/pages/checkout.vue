<script setup lang="ts">
interface PlanPerk {
  main: string
  detail?: string
  lead?: string
  rest?: string
}

interface CheckoutPlanResponse {
  plan: {
    id: string
    name: string
    monthlyPrice: number
    annual: { monthlyEquivalent: number; billedYearly: number; originalYearly: number; savings: number }
    perks: PlanPerk[]
  }
  cycle: 'annual' | 'monthly'
  price: number
  monthlyDisplay: number
  originalYearly: number | null
  savings: number | null
  dueToday: number
  label: string
}

const route = useRoute()
const router = useRouter()
const subscriptionStore = useSubscriptionStore()

const planId = computed(() => String(route.query.plan ?? 'team'))
const cycle = computed(() => String(route.query.cycle ?? 'annual') as 'annual' | 'monthly')

const { data, status, error } = await useFetch<CheckoutPlanResponse>('/api/subscription/plan', {
  key: `checkout-plan-${planId.value}-${cycle.value}`,
  query: { id: planId, cycle }
})

watchEffect(() => {
  if (data.value && !subscriptionStore.selectedSubscription) {
    subscriptionStore.setSelectedSubscription({
      id: data.value.plan.id,
      name: data.value.plan.name,
      cycle: cycle.value,
      monthlyDisplay: data.value.monthlyDisplay,
      price: data.value.price,
      label: data.value.label
    })
  }
})

useSeoMeta({
  title: 'Checkout',
  description: 'Complete your subscription and start your 3-day free trial.'
})

const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const fullName = ref('')
const address = ref('')
const consent = ref(false)
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)

const formatMoney = (v: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

const annualTotal = computed(() => (data.value ? formatMoney(data.value.price) : '—'))

const trialEndDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
})

function onExpiryInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '').slice(0, 4)
  if (raw.length >= 3) {
    cardExpiry.value = raw.slice(0, 2) + ' / ' + raw.slice(2)
  } else if (raw.length === 2 && !cardExpiry.value.includes('/')) {
    cardExpiry.value = raw + ' / '
  } else {
    cardExpiry.value = raw
  }
  nextTick(() => input.setSelectionRange(cardExpiry.value.length, cardExpiry.value.length))
}

function onExpiryKeydown(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
}

async function handleSubmit() {
  submitError.value = ''
  submitting.value = true
  try {
    await $fetch('/api/subscription/create', {
      method: 'POST',
      body: {
        planId: planId.value,
        cycle: cycle.value,
        fullName: fullName.value,
        address: address.value,
        cardNumber: cardNumber.value,
        cardExpiry: cardExpiry.value,
        cardCvc: cardCvc.value,
        consent: consent.value
      }
    })
    submitted.value = true
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    submitError.value = e?.data?.statusMessage ?? e?.message ?? 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#edf1f4]">
    <div class="bg-[#2d3748] py-4 text-center">
      <h1 class="text-lg font-bold text-white tracking-wide">
        Checkout
      </h1>
    </div>

    <div
      v-if="status === 'pending'"
      class="flex items-center justify-center py-32"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-700" />
        <p class="text-sm text-gray-500">Loading plan details…</p>
      </div>
    </div>

    <div
      v-else-if="error || !data"
      class="mx-auto max-w-lg px-5 py-16 text-center"
    >
      <p class="text-sm font-medium text-red-600">Failed to load plan. Please go back and try again.</p>
    </div>

    <div
      v-else-if="submitted"
      class="mx-auto max-w-lg px-5 py-24 text-center"
    >
      <div class="rounded-xl border border-green-200 bg-white p-10 shadow-sm">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100">
          <UIcon name="i-lucide-check" class="size-7 text-green-600" />
        </div>
        <h2 class="text-xl font-bold text-[#1e2733]">
          You're in! Your 3-day free trial has started.
        </h2>
        <p class="mt-2 text-sm text-gray-500">
          You won't be charged until {{ trialEndDate }}.
        </p>
        <UButton
          label="Go to dashboard"
          color="primary"
          block
          size="lg"
          class="mt-8"
          @click="router.push('/')"
        />
      </div>
    </div>

    <template v-else>
      <div class="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
        <NuxtLink
          to="/products"
          class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-[#696969] hover:underline"
        >
          &lt;&lt; back
        </NuxtLink>

        <div
          v-if="subscriptionStore.selectedSubscription"
          class="mb-6 rounded-lg border border-[#d7dde4] bg-white p-5 shadow-sm"
        >
          <p class="text-xs uppercase tracking-[0.2em] text-[#5f6c7b]">Selected subscription</p>
          <p class="mt-2 text-lg font-semibold text-[#1e2733]">
            {{ subscriptionStore.selectedSubscription.name }} — {{ subscriptionStore.selectedSubscription.cycle }}
          </p>
          <p class="text-sm text-[#4a5968]">
            {{ subscriptionStore.selectedSubscription.label }} · ${{ formatMoney(subscriptionStore.selectedSubscription.monthlyDisplay) }} / month
          </p>
        </div>

        <h2 class="mb-1 text-2xl font-extrabold leading-tight text-[#1e2733] sm:text-3xl">
          You're Almost In - Start Your 3-Day Free Trial Now!
        </h2>
        <p class="mb-8 text-sm text-[#4a5968]">
          Set up your account to gain instant access! You won't be charged if you decide to cancel within 3 days
        </p>

        <div class="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <div class="rounded-lg border border-[#d7dde4] bg-[#f8fafc] px-6 py-8 shadow-sm">
            <div class="-mx-6 -mt-8 mb-7 h-1.5 rounded-t-lg bg-linear-to-r from-[#58d62d] to-[#17c0d6]" />

            <h3 class="text-lg font-bold text-[#1e2733]">
              {{ data.label }}
            </h3>

            <p class="mt-4 inline-block rounded bg-[#e7ebef] px-2 py-0.5 text-xs font-semibold text-[#606d7b]">
              {{ cycle === 'annual' ? '3-days free then:' : 'Then:' }}
            </p>

            <div class="mt-3 flex items-end gap-1 leading-none">
              <span class="text-3xl font-extrabold tracking-tight text-[#1f2a37]">
                ${{ formatMoney(data.monthlyDisplay) }}
              </span>
              <span class="pb-0.5 text-base font-medium text-[#5f6c7b]">/month</span>
            </div>

            <p class="mt-3 text-sm text-[#4a5968]">
              <span>billed {{ cycle === 'annual' ? 'yearly' : 'monthly' }} at </span>
              <span
                v-if="cycle === 'annual' && data.originalYearly"
                class="line-through text-[#7e8895]"
              >
                ${{ formatMoney(data.originalYearly) }}
              </span>
              <span class="font-semibold text-[#2f3f50]"> ${{ formatMoney(data.price) }}</span>
            </p>

            <p
              v-if="data.savings"
              class="mt-4 inline-block rounded bg-[#d7dde4] px-2 py-0.5 text-sm font-semibold text-[#1e8f45]"
            >
              ${{ formatMoney(data.savings) }} in savings
            </p>

            <USeparator class="my-5" />

            <ul class="space-y-3.5">
              <li
                v-for="perk in data.plan.perks"
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
          </div>

          <div class="rounded-lg border border-[#d7dde4] bg-white px-6 py-7 shadow-sm">
            <h3 class="mb-5 text-base font-bold text-[#1e2733]">
              Order Summary
            </h3>

            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-[#4a5968]">{{ cycle === 'annual' ? 'Annual' : 'Monthly' }} Plan</span>
                <span class="font-semibold text-[#1e2733]">${{ annualTotal }}</span>
              </div>

              <div class="flex items-start justify-between">
                <span class="text-[#4a5968]">
                  Total Due
                  <span class="text-xs text-[#7e8895]">(*not including sales tax where applicable)</span>
                </span>
                <span class="ml-4 shrink-0 font-semibold text-[#1e2733]">${{ annualTotal }}</span>
              </div>

              <div class="flex items-center justify-between border-t border-[#e7ebef] pt-2">
                <span class="font-bold text-[#1e2733]">Due Today</span>
                <span class="font-bold text-[#1e2733]">$0.00</span>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 w-full cursor-default bg-[#f0f2f5] py-4.5 text-sm font-medium text-[#4a5968]"
            >
              Includes 3-Day Free Trial
            </button>

            <USeparator class="my-6" />

            <form @submit.prevent="handleSubmit">
              <div class="mb-5 flex items-center gap-2">
                <h3 class="text-base font-bold text-[#1e2733]">
                  Billing Information
                </h3>
                <UIcon name="i-lucide-info" class="size-4 text-[#7e8895]" />
              </div>

              <p class="mb-1.5 text-xs font-medium tracking-wide text-[#7e8895]">
                Card Details
              </p>
              <div class="flex items-center gap-2 rounded border border-[#d7dde4] bg-[#f8f8f8] px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
                <UIcon name="i-lucide-credit-card" class="size-4 shrink-0 text-[#7e8895]" />
                <input
                  v-model="cardNumber"
                  type="text"
                  inputmode="numeric"
                  placeholder="Number"
                  maxlength="19"
                  required
                  class="min-w-0 flex-1 bg-transparent text-sm text-[#1e2733] placeholder-[#b0bac5] outline-none"
                />
                <input
                  :value="cardExpiry"
                  type="text"
                  inputmode="numeric"
                  placeholder="MM / YY"
                  maxlength="7"
                  required
                  class="w-20 bg-transparent text-center text-sm text-[#1e2733] placeholder-[#b0bac5] outline-none"
                  @input="onExpiryInput"
                  @keydown="onExpiryKeydown"
                />
                <input
                  v-model="cardCvc"
                  type="text"
                  placeholder="CVC"
                  maxlength="4"
                  required
                  class="w-10 bg-transparent text-center text-sm text-[#1e2733] placeholder-[#b0bac5] outline-none"
                />
              </div>

              <p class="mb-1.5 mt-4 text-xs font-medium tracking-wide text-[#7e8895]">
                Address
              </p>
              <div class="bg-[#f8f8f8] rounded border border-[#d7dde4] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
                <div class="px-3 pt-2 pb-2.5">
                  <p class="mb-1 text-xs text-[#000000]">Full name</p>
                  <input
                    v-model="fullName"
                    type="text"
                    required
                    class="bg-[#ffffff] w-full text-sm text-[#1e2733] h-10 border border-[#d7dde4] rounded outline-none pl-2"
                  />
                </div>
                <div class="border-t border-[#d7dde4] px-3 pt-2 pb-2.5">
                  <p class="mb-1 text-xs text-[#000000]">Address</p>
                  <input
                    v-model="address"
                    type="text"
                    required
                    class="bg-[#ffffff] w-full text-sm text-[#1e2733] h-10 border border-[#d7dde4] rounded outline-none pl-2"
                  />
                </div>
              </div>

              <label class="mt-5 flex cursor-pointer items-start gap-3">
                <input
                  v-model="consent"
                  type="checkbox"
                  class="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#1e8f45]"
                />
                <span class="text-xs leading-relaxed text-[#4a5968]">
                  I consent to <strong class="font-semibold underline">Terms of Use</strong> and understand my 3-day free trial will automatically convert to <strong>${{ annualTotal }}</strong> per {{ cycle === 'annual' ? 'year' : 'month' }} starting on {{ trialEndDate }}. The yearly fee will be automatically charged each year going forward unless I cancel my account at least one (1) business day before the end of the current billing period, which can be done by calling (888) 463-3163.
                </span>
              </label>

              <p
                v-if="submitError"
                class="mt-3 text-xs font-medium text-red-600"
              >
                {{ submitError }}
              </p>

              <button
                type="submit"
                :disabled="!consent || submitting"
                class="mt-5 w-full rounded py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:bg-[#c5cdd5] disabled:text-[#7e8895]"
                :class="consent && !submitting ? 'bg-[#f5a623] text-black hover:bg-[#e99510]' : ''"
              >
                <span v-if="submitting">Processing…</span>
                <span v-else>Try It Free</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
