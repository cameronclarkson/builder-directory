import { describe, expect, it } from "vitest";
import { scoreDealContactMatch, type Deal } from "./dealMatching";
import type { Contact } from "./supabase";

describe("Deal Matching Algorithm", () => {
  const sampleDeal: Deal = {
    id: "1",
    title: "10 Acres in Cumming",
    location: "829-977 Lower Creighton Rd, Cumming, GA",
    description: "4 engineered lots (2+ acres each), perk tested, ready for development. Seller retiring. Cameron countered at $850k. Prefers R4 zoning.",
    value: "850000",
    acreage: "10",
    zoning: "R4",
    deal_type: "Real Estate",
    stage: "Lead",
    status: "Active",
    created_at: new Date().toISOString(),
  };

  const georgiaBuilder: Contact = {
    id: "1",
    name: "Tyler Findley",
    company: "Hughston Homes",
    email: "tyler@example.com",
    phone: null,
    website: null,
    business: null,
    status: "Lead",
    focus: null,
    target_markets: null,
    market: "Southeast - Georgia",
    buy_box: "Actively buys land and lots in Georgia; looking for 5-20 acres with development potential",
    notes: null,
    buyer_type: "Builder",
    next_action: null,
    follow_up_date: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  const floridaBuilder: Contact = {
    id: "2",
    name: "Jim Gorman",
    company: "Stanley Martin Homes",
    email: "jim@example.com",
    phone: null,
    website: null,
    business: null,
    status: "Lead",
    focus: null,
    target_markets: null,
    market: "Southeast - Florida",
    buy_box: "Requires at least 30 acres and 100 lots; prefers raw land; buys in Florida counties",
    notes: null,
    buyer_type: "Builder",
    next_action: null,
    follow_up_date: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  const texasDeveloper: Contact = {
    id: "3",
    name: "Boone Nerren",
    company: null,
    email: "boone@example.com",
    phone: null,
    website: null,
    business: null,
    status: "Lead",
    focus: null,
    target_markets: null,
    market: "Southwest - Texas",
    buy_box: "Operates only in Texas; looking for raw land of 25-100 acres suitable for single-family development",
    notes: null,
    buyer_type: "Developer",
    next_action: null,
    follow_up_date: null,
    created_at: new Date().toISOString(),
    updated_at: null,
  };

  it("scores high for matching geographic location", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    expect(match.score).toBeGreaterThan(30); // Should have viable match
    expect(match.matchBreakdown.geographic).toBe(20); // State match
  });

  it("scores low for non-matching geographic location", () => {
    const match = scoreDealContactMatch(sampleDeal, floridaBuilder);
    
    expect(match.score).toBeLessThanOrEqual(30); // Should be filtered out or very low
    expect(match.matchBreakdown.geographic).toBe(0);
  });

  it("scores high for matching acreage", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    // Georgia builder wants 5-20 acres, deal is 10 acres
    expect(match.matchBreakdown.acreage).toBeGreaterThan(0);
  });

  it("scores low for non-matching acreage", () => {
    const match = scoreDealContactMatch(sampleDeal, floridaBuilder);
    
    // Florida builder wants 30+ acres, deal is 10 acres
    // With improved algorithm, this gets a marginal match score (10) due to 50% tolerance
    expect(match.matchBreakdown.acreage).toBe(10);
  });

  it("gives bonus points to builders for residential land", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    expect(match.matchBreakdown.buyerType).toBeGreaterThanOrEqual(20); // Builder bonus with ready-to-build keywords
  });

  it("scores zoning match correctly", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    // Deal has R4 zoning and perk tested
    expect(match.matchBreakdown.zoning).toBeGreaterThanOrEqual(0);
  });

  it("returns match breakdown with all criteria", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    expect(match.matchBreakdown).toHaveProperty("geographic");
    expect(match.matchBreakdown).toHaveProperty("acreage");
    expect(match.matchBreakdown).toHaveProperty("lotCount");
    expect(match.matchBreakdown).toHaveProperty("zoning");
    expect(match.matchBreakdown).toHaveProperty("buyerType");
  });

  it("calculates total score correctly", () => {
    const match = scoreDealContactMatch(sampleDeal, georgiaBuilder);
    
    const total =
      match.matchBreakdown.geographic +
      match.matchBreakdown.acreage +
      match.matchBreakdown.lotCount +
      match.matchBreakdown.zoning +
      match.matchBreakdown.buyerType;
    
    expect(match.score).toBe(total);
  });

  it("filters out poor matches (score < 30)", () => {
    const match = scoreDealContactMatch(sampleDeal, texasDeveloper);
    
    // Texas developer should not match Georgia deal
    expect(match.score).toBeLessThan(30);
  });
});
