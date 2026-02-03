import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  deals: router({
    list: publicProcedure.query(async () => {
      const { getAllDeals } = await import("./dealMatching");
      return getAllDeals();
    }),
    listWithMatches: publicProcedure.query(async () => {
      const { getAllDealsWithMatches } = await import("./dealMatching");
      return getAllDealsWithMatches();
    }),
    getRecommendedBuyers: publicProcedure
      .input(z.object({ dealId: z.string() }))
      .query(async ({ input }) => {
        const { getRecommendedBuyers } = await import("./dealMatching");
        return getRecommendedBuyers(input.dealId);
      }),
  }),

  contacts: router({
    list: publicProcedure.query(async () => {
      const { getAllContacts } = await import("./supabase");
      return getAllContacts();
    }),
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          market: z.string().optional(),
          buyerType: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { searchContacts } = await import("./supabase");
        return searchContacts(input.query || "", input.market, input.buyerType);
      }),
    getFilters: publicProcedure.query(async () => {
      const { getUniqueMarkets, getUniqueBuyerTypes } = await import("./supabase");
      const [markets, buyerTypes] = await Promise.all([
        getUniqueMarkets(),
        getUniqueBuyerTypes(),
      ]);
      return { markets, buyerTypes };
    }),
  }),
});

export type AppRouter = typeof appRouter;
