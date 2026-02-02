import { describe, it, expect, vi, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the Supabase client
vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
  getAllContacts: vi.fn(async () => [
    {
      id: "1",
      name: "Chris Newton",
      company: "Meritage Homes",
      email: "cnewton@meritagehomes.com",
      phone: null,
      website: null,
      business: "Clarkson Capital",
      status: "Lead",
      focus: "Builder/Investor",
      target_markets: null,
      buy_box: null,
      next_action: "Review Buy Box",
      follow_up_date: null,
      created_at: "2026-01-30T15:03:50.736Z",
    },
    {
      id: "2",
      name: "David Wright",
      company: "Vantage Point Commercial Capital",
      email: "david@vpc.capital",
      phone: null,
      website: null,
      business: "Clarkson Capital",
      status: "Lead",
      focus: "Land Wholesaler",
      target_markets: null,
      buy_box: null,
      next_action: "Call Today",
      follow_up_date: null,
      created_at: "2026-01-30T15:03:50.736Z",
    },
  ]),
  searchContacts: vi.fn(async (query: string, status?: string, focus?: string) => {
    const contacts = [
      {
        id: "1",
        name: "Chris Newton",
        company: "Meritage Homes",
        email: "cnewton@meritagehomes.com",
        phone: null,
        website: null,
        business: "Clarkson Capital",
        status: "Lead",
        focus: "Builder/Investor",
        target_markets: null,
        buy_box: null,
        next_action: "Review Buy Box",
        follow_up_date: null,
        created_at: "2026-01-30T15:03:50.736Z",
      },
      {
        id: "2",
        name: "David Wright",
        company: "Vantage Point Commercial Capital",
        email: "david@vpc.capital",
        phone: null,
        website: null,
        business: "Clarkson Capital",
        status: "Lead",
        focus: "Land Wholesaler",
        target_markets: null,
        buy_box: null,
        next_action: "Call Today",
        follow_up_date: null,
        created_at: "2026-01-30T15:03:50.736Z",
      },
    ];

    let filtered = contacts;

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.focus?.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }

    if (focus && focus !== "all") {
      filtered = filtered.filter((c) => c.focus === focus);
    }

    return filtered;
  }),
  getUniqueStatuses: vi.fn(async () => ["Lead"]),
  getUniqueFocuses: vi.fn(async () => ["Builder/Investor", "Land Wholesaler"]),
}));

function createContext(): TrpcContext {
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
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("contacts.list", () => {
    it("should fetch all contacts", async () => {
      const result = await caller.contacts.list();
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Chris Newton");
      expect(result[1]?.name).toBe("David Wright");
    });
  });

  describe("contacts.search", () => {
    it("should search by name", async () => {
      const result = await caller.contacts.search({
        query: "Chris",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Chris Newton");
    });

    it("should search by company", async () => {
      const result = await caller.contacts.search({
        query: "Meritage",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.company).toBe("Meritage Homes");
    });

    it("should search by email", async () => {
      const result = await caller.contacts.search({
        query: "david@vpc",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("David Wright");
    });

    it("should search by focus", async () => {
      const result = await caller.contacts.search({
        query: "Builder",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.focus).toBe("Builder/Investor");
    });

    it("should filter by status", async () => {
      const result = await caller.contacts.search({
        status: "Lead",
      });
      expect(result).toHaveLength(2);
    });

    it("should filter by focus", async () => {
      const result = await caller.contacts.search({
        focus: "Land Wholesaler",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.focus).toBe("Land Wholesaler");
    });

    it("should combine search query and filters", async () => {
      const result = await caller.contacts.search({
        query: "Chris",
        status: "Lead",
        focus: "Builder/Investor",
      });
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe("Chris Newton");
    });

    it("should return empty array when no matches", async () => {
      const result = await caller.contacts.search({
        query: "NonExistent",
      });
      expect(result).toHaveLength(0);
    });
  });

  describe("contacts.getFilters", () => {
    it("should return available statuses and focuses", async () => {
      const result = await caller.contacts.getFilters();
      expect(result.statuses).toContain("Lead");
      expect(result.focuses).toContain("Builder/Investor");
      expect(result.focuses).toContain("Land Wholesaler");
    });
  });
});
