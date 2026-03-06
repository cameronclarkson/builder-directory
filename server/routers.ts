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
    getById: publicProcedure
      .input(z.object({ dealId: z.string() }))
      .query(async ({ input }) => {
        const { getDealById } = await import("./dealMatching");
        return getDealById(input.dealId);
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          location: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
          value: z.string().nullable().optional(),
          acreage: z.string().nullable().optional(),
          zoning: z.string().nullable().optional(),
          deal_type: z.string().nullable().optional(),
          stage: z.string().nullable().optional(),
          status: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const { updateDeal } = await import("./dealMatching");
        return updateDeal(id, updates);
      }),
    getRecommendedBuyers: publicProcedure
      .input(z.object({ dealId: z.string() }))
      .query(async ({ input }) => {
        const { getRecommendedBuyers } = await import("./dealMatching");
        return getRecommendedBuyers(input.dealId);
      }),
    semanticSearch: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(50).optional(),
          threshold: z.number().min(0).max(1).optional(),
        })
      )
      .query(async ({ input }) => {
        const { semanticSearchDeals } = await import("./embeddings");
        return semanticSearchDeals(input.query, {
          limit: input.limit,
          threshold: input.threshold,
        });
      }),
    researchBuyers: publicProcedure
      .input(z.object({ dealId: z.union([z.string(), z.number()]), mode: z.enum(["deep", "wide"]) }))
      .mutation(async ({ input }) => {
        // TODO: Implement AI buyer research
        // For now, return mock response
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
          success: true,
          buyersFound: input.mode === "deep" ? 5 : 15,
          mode: input.mode,
        };
      }),
    updateStage: publicProcedure
      .input(z.object({ dealId: z.union([z.string(), z.number()]), stage: z.string() }))
      .mutation(async ({ input }) => {
        const { updateDealStage } = await import("./dealMatching");
        const dealIdStr = input.dealId.toString();
        return updateDealStage(dealIdStr, input.stage);
      }),
    delete: publicProcedure
      .input(z.object({ dealId: z.union([z.string(), z.number()]) }))
      .mutation(async ({ input }) => {
        const { deleteDeal } = await import("./dealMatching");
        const dealIdStr = input.dealId.toString();
        return deleteDeal(dealIdStr);
      }),
  }),

  contacts: router({
    list: publicProcedure.query(async () => {
      const { getAllContacts } = await import("./supabase");
      return getAllContacts();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getContactById } = await import("./supabase");
        return getContactById(input.id);
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          email: z.string().nullable().optional(),
          company: z.string().nullable().optional(),
          phone: z.string().nullable().optional(),
          website: z.string().nullable().optional(),
          market: z.string().nullable().optional(),
          buy_box: z.string().nullable().optional(),
          notes: z.string().nullable().optional(),
          buyer_type: z.string().nullable().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const { updateContact } = await import("./supabase");
        return updateContact(id, updates);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const { deleteContact } = await import("./supabase");
        await deleteContact(input.id);
        return { success: true };
      }),
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          market: z.union([z.string(), z.array(z.string())]).optional(),
          buyerType: z.union([z.string(), z.array(z.string())]).optional(),
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
    semanticSearch: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(50).optional(),
          threshold: z.number().min(0).max(1).optional(),
        })
      )
      .query(async ({ input }) => {
        const { semanticSearchContacts } = await import("./embeddings");
        return semanticSearchContacts(input.query, {
          limit: input.limit,
          threshold: input.threshold,
        });
      }),
  }),

  interactions: router({
    logDealSubmission: publicProcedure
      .input(
        z.object({
          dealId: z.string(),
          contactId: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { logInteraction } = await import("./interactions");
        return logInteraction({
          dealId: input.dealId,
          contactId: input.contactId,
          interactionType: "email_sent",
          status: "pending",
          notes: input.notes,
        });
      }),
    updateStatus: publicProcedure
      .input(
        z.object({
          interactionId: z.string(),
          status: z.enum(["pending", "interested", "not_interested", "closed"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateInteractionStatus } = await import("./interactions");
        return updateInteractionStatus(input.interactionId, input.status, input.notes);
      }),
    getByDeal: publicProcedure
      .input(z.object({ dealId: z.string() }))
      .query(async ({ input }) => {
        const { getInteractionsByDeal } = await import("./interactions");
        return getInteractionsByDeal(input.dealId);
      }),
    getByContact: publicProcedure
      .input(z.object({ contactId: z.string() }))
      .query(async ({ input }) => {
        const { getInteractionsByContact } = await import("./interactions");
        return getInteractionsByContact(input.contactId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
