import { describe, expect, it } from "vitest";
import { scoreDealContactMatch, Deal } from "./dealMatching";
import { Contact } from "./supabase";

describe("Business Deal Filtering", () => {
  const businessDeal: Deal = {
    id: "test-business-deal",
    title: "Worldwide Demolition Acquisition",
    location: "North Carolina",
    description: "Acquisition of a profitable demolition contractor. 2.91x TTM earnings. Projected 30%+ cash-on-cash return.",
    value: "$500,000",
    acreage: null,
    zoning: null,
    deal_type: "Business",
    stage: "Lead",
    status: "Active",
    created_at: new Date().toISOString(),
  };

  const realEstateDeal: Deal = {
    id: "test-real-estate-deal",
    title: "10 Acres in Cumming",
    location: "Cumming, GA",
    description: "10 acres of residential land ready for development",
    value: "$500,000",
    acreage: "10",
    zoning: "Residential",
    deal_type: "Real Estate",
    stage: "Lead",
    status: "Active",
    created_at: new Date().toISOString(),
  };

  const builder: Contact = {
    id: 1,
    name: "Test Builder",
    company: "Builder Co",
    email: "builder@example.com",
    phone: null,
    website: null,
    market: "Southeast - Georgia",
    business: null,
    status: "Lead",
    focus: "Builder",
    buyer_type: "Builder",
    buy_box: "10-50 acres. Residential zoning. Georgia focus.",
    target_markets: null,
    next_action: null,
    follow_up_date: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const investor: Contact = {
    ...builder,
    id: 2,
    name: "Test Investor",
    company: "Investor Co",
    buyer_type: "Investor",
    focus: "Investor",
  };

  it("should give builders a score of 0 for business deals", () => {
    const match = scoreDealContactMatch(businessDeal, builder);
    expect(match.score).toBe(0);
    expect(match.matchBreakdown.geographic).toBe(0);
    expect(match.matchBreakdown.acreage).toBe(0);
    expect(match.matchBreakdown.buyerType).toBe(0);
  });

  it("should allow investors to see business deals", () => {
    const match = scoreDealContactMatch(businessDeal, investor);
    // Investor should get some score (at least buyer type bonus)
    expect(match.score).toBeGreaterThan(0);
  });

  it("should allow builders to see real estate deals", () => {
    const match = scoreDealContactMatch(realEstateDeal, builder);
    // Builder should get some score for real estate
    expect(match.score).toBeGreaterThan(0);
  });
});
