import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
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

    it("should combine search query and market filter", async () => {
      const results = await caller.buyers.search({
        query: "Growth",
        market: "Georgia",
      });

      expect(Array.isArray(results)).toBe(true);
      results.forEach((buyer) => {
        expect(buyer.market).toBe("Georgia");
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
    it("should return available market filters", async () => {
      const filters = await caller.buyers.getFilters();

      expect(filters).toHaveProperty("markets");
      expect(Array.isArray(filters.markets)).toBe(true);
      expect(filters.markets.length).toBeGreaterThan(0);
    });

    it("should return unique markets", async () => {
      const filters = await caller.buyers.getFilters();

      const uniqueMarkets = new Set(filters.markets);
      expect(uniqueMarkets.size).toBe(filters.markets.length);
    });
  });
});
