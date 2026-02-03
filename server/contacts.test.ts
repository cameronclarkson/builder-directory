import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the supabase module
vi.mock("./supabase", () => ({
  getAllContacts: vi.fn(async () => [
    {
      id: "1",
      name: "Test Contact",
      email: "test@example.com",
      company: "Test Company",
      phone: null,
      website: null,
      business: null,
      status: "Lead",
      focus: null,
      target_markets: null,
      market: "Georgia",
      buy_box: "Test buy box",
      notes: "Test notes",
      buyer_type: "Builder",
      next_action: null,
      follow_up_date: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    },
  ]),
  searchContacts: vi.fn(async (query: string, market?: string, buyerType?: string) => {
    const allContacts = [
      {
        id: "1",
        name: "Test Contact",
        email: "test@example.com",
        company: "Test Company",
        phone: null,
        website: null,
        business: null,
        status: "Lead",
        focus: null,
        target_markets: null,
        market: "Georgia",
        buy_box: "Test buy box",
        notes: "Test notes",
        buyer_type: "Builder",
        next_action: null,
        follow_up_date: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      },
    ];

    return allContacts.filter((contact) => {
      const matchesQuery = !query || contact.name.toLowerCase().includes(query.toLowerCase());
      const matchesMarket = !market || market === "all" || contact.market === market;
      const matchesBuyerType = !buyerType || buyerType === "all" || contact.buyer_type === buyerType;
      return matchesQuery && matchesMarket && matchesBuyerType;
    });
  }),
  getUniqueMarkets: vi.fn(async () => ["Georgia", "Texas", "Florida"]),
  getUniqueBuyerTypes: vi.fn(async () => ["Builder", "Developer", "Investor"]),
}));

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("contacts router", () => {
  it("lists all contacts", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.list();

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Test Contact");
    expect(result[0]?.buyer_type).toBe("Builder");
  });

  it("searches contacts by query", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.search({
      query: "Test",
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Test Contact");
  });

  it("filters contacts by market", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.search({
      market: "Georgia",
    });

    expect(result).toHaveLength(1);
  });

  it("filters contacts by buyer type", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.search({
      buyerType: "Builder",
    });

    expect(result).toHaveLength(1);
  });

  it("returns filter options", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.getFilters();

    expect(result.markets).toContain("Georgia");
    expect(result.buyerTypes).toContain("Builder");
  });
});
