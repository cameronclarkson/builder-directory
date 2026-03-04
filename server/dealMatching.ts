import { supabase, Contact } from "./supabase";

export interface Deal {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  value: string | null;
  acreage: string | null;
  zoning: string | null;
  deal_type: string | null;
  stage: string | null;
  status: string | null;
  created_at: string;
}

export interface MatchedContact {
  contact: Contact;
  score: number;
  matchBreakdown: {
    geographic: number;
    acreage: number;
    lotCount: number;
    zoning: number;
    buyerType: number;
  };
}

export interface DealWithMatches {
  deal: Deal;
  recommendedBuyers: MatchedContact[];
}

// Extract numeric value from text (e.g., "10 acres" → 10, "25-100 acres" → [25, 100])
function extractAcreage(text: string | null): { min: number; max: number } | null {
  if (!text || typeof text !== 'string') return null;
  
  // Match range: "5-20 acres" or "25-100 acres"
  const rangeMatch = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*acres?/i);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]!), max: parseFloat(rangeMatch[2]!) };
  }
  
  // Match minimum: "30+ acres"
  const minMatch = text.match(/(\d+(?:\.\d+)?)\s*\+\s*acres?/i);
  if (minMatch) {
    const value = parseFloat(minMatch[1]!);
    return { min: value, max: value * 3 }; // Flexible upper bound
  }
  
  // Match single value with "acres": "10 acres"
  const acresMatch = text.match(/(\d+(?:\.\d+)?)\s*acres?/i);
  if (acresMatch) {
    const value = parseFloat(acresMatch[1]!);
    return { min: value * 0.5, max: value * 1.5 }; // Allow 50% variance
  }
  
  // Match numeric-only value (assume it's acreage): "10"
  const numericMatch = text.match(/^(\d+(?:\.\d+)?)$/);
  if (numericMatch) {
    const value = parseFloat(numericMatch[1]!);
    return { min: value * 0.5, max: value * 1.5 }; // Allow 50% variance
  }
  
  return null;
}

// Extract lot/unit count from text
function extractLotCount(text: string | null): { min: number; max: number } | null {
  if (!text || typeof text !== 'string') return null;
  
  const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*(?:lots?|units?|homes?)/i);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]!), max: parseInt(rangeMatch[2]!) };
  }
  
  const minMatch = text.match(/(\d+)\s*\+\s*(?:lots?|units?|homes?)/i);
  if (minMatch) {
    const value = parseInt(minMatch[1]!);
    return { min: value, max: value * 3 }; // Flexible upper bound
  }
  
  const singleMatch = text.match(/(\d+)\s*(?:lots?|units?|homes?)/i);
  if (singleMatch) {
    const value = parseInt(singleMatch[1]!);
    return { min: value, max: value };
  }
  
  return null;
}

// Check if location matches market
function calculateGeographicScore(dealLocation: string | null, contactMarket: string | null): number {
  if (!dealLocation || typeof dealLocation !== 'string' || !contactMarket || typeof contactMarket !== 'string' || contactMarket === "Unknown" || contactMarket === "") {
    return 0;
  }
  
  const dealLower = dealLocation.toLowerCase();
  const marketLower = contactMarket.toLowerCase();
  
  // Extract state from deal location (e.g., "Cumming, GA" → "ga")
  const dealStateMatch = dealLocation.match(/,\s*([A-Z]{2})\s*$/i);
  const dealState = dealStateMatch ? dealStateMatch[1]!.toLowerCase() : null;
  
  // Extract city from deal location
  const dealCity = dealLocation.split(",")[0]?.trim().toLowerCase();
  
  // Check for city match first (highest priority)
  if (dealCity && marketLower.includes(dealCity)) {
    return 40;
  }
  
  // Check for state match (e.g., "Georgia" in market matches "GA" in deal)
  if (dealState) {
    // Map state abbreviations to full names
    const stateMap: Record<string, string> = {
      ga: "georgia",
      nc: "north carolina",
      sc: "south carolina",
      fl: "florida",
      tx: "texas",
      tn: "tennessee",
      al: "alabama",
    };
    
    const stateName = stateMap[dealState];
    if (stateName && marketLower.includes(stateName)) {
      return 20;
    }
    if (marketLower.includes(dealState)) {
      return 20;
    }
  }
  
  // Check for exact market match
  if (marketLower.includes(dealLower) || dealLower.includes(marketLower)) {
    return 30;
  }
  
  return 0;
}

// Calculate acreage match score
function calculateAcreageScore(
  dealAcreage: string | null,
  dealDescription: string | null,
  contactBuyBox: string | null
): number {
  const dealAcreageData = extractAcreage(dealAcreage || dealDescription || "");
  const buyBoxAcreageData = extractAcreage(contactBuyBox || "");
  
  if (!dealAcreageData || !buyBoxAcreageData) {
    return 0;
  }
  
  // Check if deal acreage falls within contact's range
  const dealAvg = (dealAcreageData.min + dealAcreageData.max) / 2;
  
  if (dealAvg >= buyBoxAcreageData.min && dealAvg <= buyBoxAcreageData.max) {
    return 30; // Perfect match - increased weight
  }
  
  // Check if within 30% of range (more flexible)
  const tolerance = 0.3;
  const lowerBound = buyBoxAcreageData.min * (1 - tolerance);
  const upperBound = buyBoxAcreageData.max * (1 + tolerance);
  
  if (dealAvg >= lowerBound && dealAvg <= upperBound) {
    return 20; // Close match
  }
  
  // Check if within 50% of range (still viable)
  const wideTolerance = 0.5;
  const wideLowerBound = buyBoxAcreageData.min * (1 - wideTolerance);
  const wideUpperBound = buyBoxAcreageData.max * (1 + wideTolerance);
  
  if (dealAvg >= wideLowerBound && dealAvg <= wideUpperBound) {
    return 10; // Marginal match
  }
  
  return 0;
}

// Calculate lot count match score
function calculateLotCountScore(
  dealDescription: string | null,
  contactBuyBox: string | null
): number {
  const dealLotData = extractLotCount(dealDescription || "");
  const buyBoxLotData = extractLotCount(contactBuyBox || "");
  
  if (!dealLotData || !buyBoxLotData) {
    return 0;
  }
  
  // Check if deal lot count meets contact's minimum
  if (dealLotData.min >= buyBoxLotData.min) {
    return 20; // Perfect match
  }
  
  // Check if within 30% of minimum
  const tolerance = 0.3;
  if (dealLotData.min >= buyBoxLotData.min * (1 - tolerance)) {
    return 10; // Close match
  }
  
  return 0;
}

// Calculate zoning match score
function calculateZoningScore(
  dealZoning: string | null,
  dealDescription: string | null,
  contactBuyBox: string | null
): number {
  if (!contactBuyBox || typeof contactBuyBox !== 'string') return 0;
  
  const dealZoningStr = (typeof dealZoning === 'string' ? dealZoning : "");
  const dealDescStr = (typeof dealDescription === 'string' ? dealDescription : "");
  const dealText = (dealZoningStr + " " + dealDescStr).toLowerCase();
  const buyBoxLower = contactBuyBox.toLowerCase();
  
  // Zoning type matching
  const zoningTypes = [
    { deal: ["residential", "single-family", "r3", "r4"], buyBox: ["residential", "single-family", "r3", "r4"], score: 20 },
    { deal: ["commercial", "retail", "office"], buyBox: ["commercial", "retail", "office"], score: 20 },
    { deal: ["multi-family", "multifamily", "apartment"], buyBox: ["multi-family", "multifamily", "apartment"], score: 20 },
    { deal: ["industrial", "warehouse", "manufacturing"], buyBox: ["industrial", "warehouse", "manufacturing"], score: 20 },
  ];
  
  for (const type of zoningTypes) {
    const dealHasType = type.deal.some(keyword => dealText.includes(keyword));
    const buyBoxHasType = type.buyBox.some(keyword => buyBoxLower.includes(keyword));
    if (dealHasType && buyBoxHasType) {
      return type.score;
    }
  }
  
  // Check for zoning readiness keywords
  const zoningKeywords = [
    "entitled", "zoning", "zoned", "raw land", "perk tested", 
    "development ready", "permits", "utilities"
  ];
  
  let dealHasZoning = false;
  let buyBoxHasZoning = false;
  
  for (const keyword of zoningKeywords) {
    if (dealText.includes(keyword)) dealHasZoning = true;
    if (buyBoxLower.includes(keyword)) buyBoxHasZoning = true;
  }
  
  if (!buyBoxHasZoning) return 0; // Contact has no zoning preference
  
  // Check for specific matches
  if (buyBoxLower.includes("does not require zoning") || buyBoxLower.includes("raw land")) {
    return 10; // Any zoning status acceptable
  }
  
  if (buyBoxLower.includes("entitled") && dealText.includes("entitled")) {
    return 15; // Perfect match
  }
  
  if (dealHasZoning) {
    return 8; // Partial match
  }
  
  return 0;
}

// Calculate buyer type bonus
function calculateBuyerTypeScore(
  buyerType: string | null,
  dealDescription: string | null
): number {
  if (!buyerType || typeof buyerType !== 'string') return 0;
  
  const dealText = (typeof dealDescription === 'string' ? dealDescription : "").toLowerCase();
  
  if (buyerType === "Builder") {
    return 5; // Builders are primary buyers for residential land
  }
  
  if (buyerType === "Developer") {
    // Prioritize developers for large-scale projects
    if (dealText.includes("50") || dealText.includes("100") || dealText.includes("units")) {
      return 5;
    }
    return 3;
  }
  
  if (buyerType === "Investor") {
    // Investors are generalists
    return 3;
  }
  
  return 0;
}

// Check if a deal is a business acquisition (not real estate)
function isBusinessDeal(deal: Deal): boolean {
  const title = (deal.title || "").toLowerCase();
  const description = (deal.description || "").toLowerCase();
  
  // Business acquisition keywords
  const businessKeywords = [
    "demolition", "contractor", "business acquisition", "company acquisition",
    "operations center", "corporate", "fortune 500", "ttm earnings",
    "cash-on-cash return", "profitable business"
  ];
  
  return businessKeywords.some(keyword => 
    title.includes(keyword) || description.includes(keyword)
  );
}

// Score a single deal-contact pair
export function scoreDealContactMatch(deal: Deal, contact: Contact): MatchedContact {
  // Builders should not see business deals
  if (contact.buyer_type === "Builder" && isBusinessDeal(deal)) {
    return {
      contact,
      score: 0,
      matchBreakdown: {
        geographic: 0,
        acreage: 0,
        lotCount: 0,
        zoning: 0,
        buyerType: 0,
      },
    };
  }
  
  const geographic = calculateGeographicScore(deal.location, contact.market);
  const acreage = calculateAcreageScore(deal.acreage, deal.description, contact.buy_box);
  const lotCount = calculateLotCountScore(deal.description, contact.buy_box);
  const zoning = calculateZoningScore(deal.zoning, deal.description, contact.buy_box);
  const buyerType = calculateBuyerTypeScore(contact.buyer_type, deal.description);
  
  const score = geographic + acreage + lotCount + zoning + buyerType;
  
  return {
    contact,
    score,
    matchBreakdown: {
      geographic,
      acreage,
      lotCount,
      zoning,
      buyerType,
    },
  };
}

// Get all deals from Supabase
export async function getAllDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching deals:", error);
    throw new Error(`Failed to fetch deals: ${error.message}`);
  }
  
  return data || [];
}

// Get recommended buyers for a single deal
export async function getRecommendedBuyers(dealId: string): Promise<DealWithMatches | null> {
  // Fetch the deal
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();
  
  if (dealError || !dealData) {
    console.error("Error fetching deal:", dealError);
    return null;
  }
  
  // Fetch all contacts with buy_box
  const { data: contactsData, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .not("buy_box", "is", null);
  
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return null;
  }
  
  const contacts = contactsData || [];
  
  // Score each contact
  const matches = contacts
    .map((contact) => scoreDealContactMatch(dealData, contact))
    .filter((match) => match.score >= 25) // Minimum viable match - lowered threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Top 5
  
  return {
    deal: dealData,
    recommendedBuyers: matches,
  };
}

// Get a single deal by ID with recommended buyers and source contact
export async function getDealById(dealId: string): Promise<{
  deal: Deal;
  recommendedBuyers: MatchedContact[];
  sourceContact: Contact | null;
} | null> {
  // Fetch the deal with source contact
  const { data: dealData, error: dealError } = await supabase
    .from("deals")
    .select(`
      *,
      source_contact:contacts!deals_contact_id_fkey(*)
    `)
    .eq("id", dealId)
    .single();
  
  if (dealError || !dealData) {
    console.error("Error fetching deal:", dealError);
    return null;
  }
  
  // Fetch all contacts with buy_box for matching
  const { data: contactsData, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .not("buy_box", "is", null);
  
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return null;
  }
  
  const contacts = contactsData || [];
  
  // Score each contact
  const matches = contacts
    .map((contact) => scoreDealContactMatch(dealData, contact))
    .filter((match) => match.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return {
    deal: dealData,
    recommendedBuyers: matches,
    sourceContact: (dealData as any).source_contact || null,
  };
}

// Get all deals with recommended buyers
export async function getAllDealsWithMatches(): Promise<DealWithMatches[]> {
  const deals = await getAllDeals();
  
  // Fetch all contacts once
  const { data: contactsData, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .not("buy_box", "is", null);
  
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return [];
  }
  
  const contacts = contactsData || [];
  
  // Score each deal against all contacts
  return deals.map((deal) => {
    const matches = contacts
      .map((contact) => scoreDealContactMatch(deal, contact))
      .filter((match) => match.score >= 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      deal,
      recommendedBuyers: matches,
    };
  });
}

// Update deal stage
export async function updateDealStage(dealId: string, stage: string): Promise<boolean> {
  const { error } = await supabase
    .from("deals")
    .update({ stage })
    .eq("id", dealId);
    
  if (error) {
    console.error("Error updating deal stage:", error);
    return false;
  }
  
  return true;
}

// Update deal
export async function updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", dealId)
    .select()
    .single();

  if (error) {
    console.error("Error updating deal:", error);
    throw new Error(`Failed to update deal: ${error.message}`);
  }

  // Update embeddings in background if needed (ignoring for now or call updateDealEmbedding if available)
  try {
    const { updateDealEmbedding } = await import("./embeddings");
    await updateDealEmbedding(data as Deal);
  } catch (e) {
    console.error("Failed to update deal embedding:", e);
  }

  return data as Deal;
}
