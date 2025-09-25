import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { inject } from '@vercel/analytics'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // Inject Vercel Analytics
    if (typeof window !== 'undefined') {
      inject({
        mode: 'production',
        debug: false
      })
    }
  }
} satisfies Theme