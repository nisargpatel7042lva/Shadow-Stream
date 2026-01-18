import { router } from './trpc'
import { privacyRouter } from './routers/privacy'

export const appRouter = router({
  privacy: privacyRouter,
})

export type AppRouter = typeof appRouter
