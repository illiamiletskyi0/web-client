import { plans } from '../../utils/plansData'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const planId = String(query.id ?? 'team')
  const cycle = String(query.cycle ?? 'annual') as 'annual' | 'monthly'

  const plan = plans.find(p => p.id === planId)

  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: `Plan "${planId}" not found` })
  }

  const price = cycle === 'annual' ? plan.annual.billedYearly : plan.monthlyPrice
  const monthlyDisplay = cycle === 'annual' ? plan.annual.monthlyEquivalent : plan.monthlyPrice
  const originalYearly = cycle === 'annual' ? plan.annual.originalYearly : null
  const savings = cycle === 'annual' ? plan.annual.savings : null

  return {
    plan,
    cycle,
    price,
    monthlyDisplay,
    originalYearly,
    savings,
    dueToday: 0,
    label: `${plan.name} - ${cycle === 'annual' ? 'Annual' : 'Monthly'}`
  }
})
