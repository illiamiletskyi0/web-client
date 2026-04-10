import { plans } from '../../utils/plansData'
import type { PricingPlanData } from '../../utils/plansData'

interface SubscriptionCreateBody {
  planId: string
  cycle: 'annual' | 'monthly'
  fullName: string
  address: string
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  consent: boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubscriptionCreateBody>(event)

  if (!body.planId || !body.cycle) {
    throw createError({ statusCode: 400, statusMessage: 'planId and cycle are required' })
  }

  const plan = plans.find((p: PricingPlanData) => p.id === body.planId)
  if (!plan) {
    throw createError({ statusCode: 404, statusMessage: `Plan "${body.planId}" not found` })
  }

  if (!body.consent) {
    throw createError({ statusCode: 400, statusMessage: 'You must accept the Terms of Use' })
  }

  if (!body.fullName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Full name is required' })
  }

  if (!body.cardNumber?.trim() || !body.cardExpiry?.trim() || !body.cardCvc?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Card details are required' })
  }

  return {
    success: true,
    message: 'Subscription created successfully. Your 3-day free trial has started.',
    planId: body.planId,
    cycle: body.cycle
  }
})
