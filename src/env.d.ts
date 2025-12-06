/// <reference types="astro/client" />

type RateLimiter = {
    limit: (options: { key: string }) => Promise<{ success: boolean }>
}

type ENV = {
    MY_RATE_LIMITER: RateLimiter
}

type Runtime = import('@astrojs/cloudflare').Runtime<ENV>

declare namespace App {
    interface Locals extends Runtime { }
}