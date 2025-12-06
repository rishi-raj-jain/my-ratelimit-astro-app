// File: src/pages/api/data.ts

import type { APIContext } from 'astro'

export async function GET({ request, locals }: APIContext) {
    const rateLimiter = locals.runtime?.env?.MY_RATE_LIMITER

    if (rateLimiter) {
        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'

        const { success } = await rateLimiter.limit({ key: clientIP })

        if (!success) {
            return new Response(
                JSON.stringify({ error: 'Rate limit exceeded' }),
                {
                    status: 429,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }
    }

    // Your endpoint logic here
    return new Response(
        JSON.stringify({ message: 'Success', data: { timestamp: Date.now() } }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        }
    )
}