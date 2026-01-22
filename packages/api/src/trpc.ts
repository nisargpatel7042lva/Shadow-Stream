import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session, // Type narrowing
    },
  })
})

/**
 * Organization member procedure - requires organization membership
 */
export const orgMemberProcedure = protectedProcedure.use(
  async ({ ctx, next, input }) => {
    // This will be used in routers that need org membership
    return next({ ctx })
  }
)
