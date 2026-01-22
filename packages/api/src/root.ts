import { router } from './trpc'
import { paymentRouter } from './routers/payment'
import { organizationRouter } from './routers/organization'
import { invoiceRouter } from './routers/invoice'
import { userRouter } from './routers/user'
import { complianceRouter } from './routers/compliance'
import { privacyRouter } from './routers/privacy'

export const appRouter = router({
  payment: paymentRouter,
  organization: organizationRouter,
  invoice: invoiceRouter,
  user: userRouter,
  compliance: complianceRouter,
  privacy: privacyRouter,
})

export type AppRouter = typeof appRouter
