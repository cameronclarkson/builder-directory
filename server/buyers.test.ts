import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("buyers router", () => {
  const caller = appRouter.createCaller({} as any);

  describe("buyers.list", () => {
    it("should fetch all buyers", async () => {
      const buyers = await caller.buyers.list();

      expect(Array.isArray(buyers)).toBe(true);
      expect(buyers.length).toBeGreaterThan(0);

      // Check structure of first buyer
      const buyer = buyers[0];
      expect(buyer).toHaveProperty("id");
      expect(buyer).toHaveProperty("name");
      expect(buyer).toHaveProperty("company");
      expect(buyer).toHaveProperty("email");
      expect(buyer).toHaveProperty("market");
      expect(buyer).toHaveProperty("buyer_type");
    });
  });

  describe("buyers.search", () => {
    it("should search buyers by name", async () => {
      const results = await caller.buyers.search({
        query: "Daniel",
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(
          results.some(
            (b) =>
              b.name?.toLowerCase().includes("daniel") ||
              b.company?.toLowerCase().includes("daniel") ||
              b.email?.toLowerCase().includes("daniel")
          )
        ).toBe(true);
      }
    });

    it("should search buyers by company", async () => {
      const results = await caller.buyers.search({
        query: "Meritage",
      });

      expect(Array.isArray(results)).toBe(true);
      if (results.length > 0) {
        expect(
          results.some(
            (b) =>
              b.name?.toLowerCase().includes("meritage") ||
              b.company?.toLowerCase().includes("meritage") ||
              b.email?.toLowerCase().includes("meritage")
          )
        ).toBe(true);
      }
    });

    it("should filter buyers by market", async () => {
      const results = await caller.buyers.search({
        query: "",
        market: "Georgia",
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach((buyer) => {
        expect(buyer.market).toBe("Georgia");
      });
    });

    it("should filter buyers by buyer type", async () => {
      const results = await caller.buyers.search({
        query: "",
        buyerType: "Builder",
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach((buyer) => {
        expect(buyer.buyer_type).toBe("Builder");
      });
    });

    it("should combine search query, market, and buyer type filters", async () => {
      const results = await caller.buyers.search({
        query: "Growth",
        market: "Georgia",
        buyerType: "Builder",
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach((buyer) => {
        expect(buyer.market).toBe("Georgia");
        expect(buyer.buyer_type).toBe("Builder");
      });
    });

    it("should return empty array for non-matching query", async () => {
      const results = await caller.buyers.search({
        query: "NONEXISTENT_BUYER_XYZABC",
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe("buyers.getFilters", () => {
    it("should return available market and buyer type filters", async () => {
      const filters = await caller.buyers.getFilters();

      expect(filters).toHaveProperty("markets");
      expect(filters).toHaveProperty("buyerTypes");
      expect(Array.isArray(filters.markets)).toBe(true);
      expect(Array.isArray(filters.buyerTypes)).toBe(true);
      expect(filters.markets.length).toBeGreaterThan(0);
      expect(filters.buyerTypes.length).toBeGreaterThan(0);
    });

    it("should return unique markets and buyer types", async () => {
      const filters = await caller.buyers.getFilters();

      const uniqueMarkets = new Set(filters.markets);
      expect(uniqueMarkets.size).toBe(filters.markets.length);

      const uniqueBuyerTypes = new Set(filters.buyerTypes);
      expect(uniqueBuyerTypes.size).toBe(filters.buyerTypes.length);
    });
  });
});
