import { createTRPCRouter } from "~/outing/server/api/trpc";
import { exampleRouter } from "~/outing/server/api/routers/example";
import { outingRouter } from "./routers/outingRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  outing: outingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
