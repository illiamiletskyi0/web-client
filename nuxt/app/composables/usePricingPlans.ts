export type BillingCycle = 'annual' | 'monthly'

export interface PlanPerks {
  main: string
  detail?: string
  lead?: string
  rest?: string
}

export interface PricingPlan {
  id: string
  name: string
  monthlyPrice: number
  annual: {
    monthlyEquivalent: number
    billedYearly: number
    originalYearly: number
    savings: number
  }
  extraTeamMembers: number
  extraTeamMemberCost: number
  exportsPerMonth: number
  exportOverage: number
  freeSkipTraces: number
  skipTraceOverage: number
  perks: PlanPerks[]
}

export function usePricingPlans() {
  const billingCycle = useState<BillingCycle>('pricing-billing-cycle', () => 'annual')
  const {
    data: plans,
    pending,
    error,
    refresh
  } = useFetch<PricingPlan[]>('/api/products', {
    default: () => []
  })

  const setBillingCycle = (cycle: BillingCycle) => {
    billingCycle.value = cycle
  }

  return {
    plans,
    billingCycle,
    setBillingCycle,
    pending,
    error,
    refresh
  }
}
