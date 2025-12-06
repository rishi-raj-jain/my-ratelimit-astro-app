
// File: src/middleware.ts

import { defineMiddleware } from 'astro:middleware'

// Routes to rate limit
const RATE_LIMITED_ROUTES = ['/']

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, locals } = context
  const pathname = url.pathname

  // Check if route should be rate limited
  const shouldRateLimit = RATE_LIMITED_ROUTES.some((route) =>
    pathname === (route)
  )

  if (!shouldRateLimit) {
    return next()
  }

  // Skip if rate limiter is not available (local dev)
  const rateLimiter = locals.runtime?.env?.MY_RATE_LIMITER
  if (!rateLimiter) {
    console.log('[Rate Limit] Binding not available, skipping')
    return next()
  }

  // Use client IP as the rate limit key
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'

  try {
    const { success } = await rateLimiter.limit({ key: clientIP })

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      )
    }
  } catch (error) {
    console.error('[Rate Limit] Error:', error)
    // On error, allow the request (fail open)
  }

  return next()
})