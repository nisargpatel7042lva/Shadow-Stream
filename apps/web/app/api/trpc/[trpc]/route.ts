import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@shadowstream/api'
import { createContext } from '@shadowstream/api/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => createContext({ req }),
  })

export { handler as GET, handler as POST }
