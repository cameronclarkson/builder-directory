var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/supabase.ts
var supabase_exports = {};
__export(supabase_exports, {
  getAllContacts: () => getAllContacts,
  getUniqueBuyerTypes: () => getUniqueBuyerTypes,
  getUniqueMarkets: () => getUniqueMarkets,
  searchContacts: () => searchContacts,
  supabase: () => supabase
});
import { createClient } from "@supabase/supabase-js";
async function getAllContacts() {
  const { data, error } = await supabase.from("contacts").select("*").order("company", { ascending: true });
  if (error) {
    console.error("Error fetching contacts:", error);
    throw new Error(`Failed to fetch contacts: ${error.message}`);
  }
  return data || [];
}
async function searchContacts(query, marketFilter, buyerTypeFilter) {
  let q = supabase.from("contacts").select("*");
  if (query) {
    q = q.or(
      `name.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
    );
  }
  if (marketFilter && marketFilter !== "all") {
    q = q.eq("market", marketFilter);
  }
  if (buyerTypeFilter && buyerTypeFilter !== "all") {
    q = q.eq("buyer_type", buyerTypeFilter);
  }
  const { data, error } = await q.order("company", { ascending: true });
  if (error) {
    console.error("Error searching contacts:", error);
    throw new Error(`Failed to search contacts: ${error.message}`);
  }
  return data || [];
}
async function getUniqueMarkets() {
  const { data, error } = await supabase.from("contacts").select("market").not("market", "is", null);
  if (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
  const markets = data?.map((item) => item.market).filter((m) => m !== null && m !== "");
  return Array.from(new Set(markets || [])).sort();
}
async function getUniqueBuyerTypes() {
  const { data, error } = await supabase.from("contacts").select("buyer_type").not("buyer_type", "is", null);
  if (error) {
    console.error("Error fetching buyer types:", error);
    return [];
  }
  const types = data?.map((item) => item.buyer_type).filter((t2) => t2 !== null && t2 !== "");
  return Array.from(new Set(types || [])).sort();
}
var supabaseUrl, supabaseKey, supabase;
var init_supabase = __esm({
  "server/supabase.ts"() {
    "use strict";
    supabaseUrl = "https://erfvtaswzlawzegwnlww.supabase.co";
    supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnZ0YXN3emxhd3plZ3dubHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzkyMjUsImV4cCI6MjA4NTM1NTIyNX0.wFwN0QzRTJMROTVMIyduzlGuhBwnRQ_JUb414aJjkSo";
    supabase = createClient(supabaseUrl, supabaseKey);
  }
});

// server/dealMatching.ts
var dealMatching_exports = {};
__export(dealMatching_exports, {
  getAllDeals: () => getAllDeals,
  getAllDealsWithMatches: () => getAllDealsWithMatches,
  getDealById: () => getDealById,
  getRecommendedBuyers: () => getRecommendedBuyers,
  scoreDealContactMatch: () => scoreDealContactMatch
});
function extractAcreage(text2) {
  if (!text2 || typeof text2 !== "string") return null;
  const rangeMatch = text2.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*acres?/i);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  }
  const minMatch = text2.match(/(\d+(?:\.\d+)?)\s*\+\s*acres?/i);
  if (minMatch) {
    const value = parseFloat(minMatch[1]);
    return { min: value, max: value * 3 };
  }
  const acresMatch = text2.match(/(\d+(?:\.\d+)?)\s*acres?/i);
  if (acresMatch) {
    const value = parseFloat(acresMatch[1]);
    return { min: value * 0.5, max: value * 1.5 };
  }
  const numericMatch = text2.match(/^(\d+(?:\.\d+)?)$/);
  if (numericMatch) {
    const value = parseFloat(numericMatch[1]);
    return { min: value * 0.5, max: value * 1.5 };
  }
  return null;
}
function extractLotCount(text2) {
  if (!text2 || typeof text2 !== "string") return null;
  const rangeMatch = text2.match(/(\d+)\s*-\s*(\d+)\s*(?:lots?|units?|homes?)/i);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }
  const minMatch = text2.match(/(\d+)\s*\+\s*(?:lots?|units?|homes?)/i);
  if (minMatch) {
    const value = parseInt(minMatch[1]);
    return { min: value, max: value * 3 };
  }
  const singleMatch = text2.match(/(\d+)\s*(?:lots?|units?|homes?)/i);
  if (singleMatch) {
    const value = parseInt(singleMatch[1]);
    return { min: value, max: value };
  }
  return null;
}
function calculateGeographicScore(dealLocation, contactMarket) {
  if (!dealLocation || typeof dealLocation !== "string" || !contactMarket || typeof contactMarket !== "string" || contactMarket === "Unknown" || contactMarket === "") {
    return 0;
  }
  const dealLower = dealLocation.toLowerCase();
  const marketLower = contactMarket.toLowerCase();
  const dealStateMatch = dealLocation.match(/,\s*([A-Z]{2})\s*$/i);
  const dealState = dealStateMatch ? dealStateMatch[1].toLowerCase() : null;
  const dealCity = dealLocation.split(",")[0]?.trim().toLowerCase();
  if (dealCity && marketLower.includes(dealCity)) {
    return 40;
  }
  if (dealState) {
    const stateMap = {
      ga: "georgia",
      nc: "north carolina",
      sc: "south carolina",
      fl: "florida",
      tx: "texas",
      tn: "tennessee",
      al: "alabama"
    };
    const stateName = stateMap[dealState];
    if (stateName && marketLower.includes(stateName)) {
      return 20;
    }
    if (marketLower.includes(dealState)) {
      return 20;
    }
  }
  if (marketLower.includes(dealLower) || dealLower.includes(marketLower)) {
    return 30;
  }
  return 0;
}
function calculateAcreageScore(dealAcreage, dealDescription, contactBuyBox) {
  const dealAcreageData = extractAcreage(dealAcreage || dealDescription || "");
  const buyBoxAcreageData = extractAcreage(contactBuyBox || "");
  if (!dealAcreageData || !buyBoxAcreageData) {
    return 0;
  }
  const dealAvg = (dealAcreageData.min + dealAcreageData.max) / 2;
  if (dealAvg >= buyBoxAcreageData.min && dealAvg <= buyBoxAcreageData.max) {
    return 30;
  }
  const tolerance = 0.3;
  const lowerBound = buyBoxAcreageData.min * (1 - tolerance);
  const upperBound = buyBoxAcreageData.max * (1 + tolerance);
  if (dealAvg >= lowerBound && dealAvg <= upperBound) {
    return 20;
  }
  const wideTolerance = 0.5;
  const wideLowerBound = buyBoxAcreageData.min * (1 - wideTolerance);
  const wideUpperBound = buyBoxAcreageData.max * (1 + wideTolerance);
  if (dealAvg >= wideLowerBound && dealAvg <= wideUpperBound) {
    return 10;
  }
  return 0;
}
function calculateLotCountScore(dealDescription, contactBuyBox) {
  const dealLotData = extractLotCount(dealDescription || "");
  const buyBoxLotData = extractLotCount(contactBuyBox || "");
  if (!dealLotData || !buyBoxLotData) {
    return 0;
  }
  if (dealLotData.min >= buyBoxLotData.min) {
    return 20;
  }
  const tolerance = 0.3;
  if (dealLotData.min >= buyBoxLotData.min * (1 - tolerance)) {
    return 10;
  }
  return 0;
}
function calculateZoningScore(dealZoning, dealDescription, contactBuyBox) {
  if (!contactBuyBox || typeof contactBuyBox !== "string") return 0;
  const dealZoningStr = typeof dealZoning === "string" ? dealZoning : "";
  const dealDescStr = typeof dealDescription === "string" ? dealDescription : "";
  const dealText = (dealZoningStr + " " + dealDescStr).toLowerCase();
  const buyBoxLower = contactBuyBox.toLowerCase();
  const zoningTypes = [
    { deal: ["residential", "single-family", "r3", "r4"], buyBox: ["residential", "single-family", "r3", "r4"], score: 20 },
    { deal: ["commercial", "retail", "office"], buyBox: ["commercial", "retail", "office"], score: 20 },
    { deal: ["multi-family", "multifamily", "apartment"], buyBox: ["multi-family", "multifamily", "apartment"], score: 20 },
    { deal: ["industrial", "warehouse", "manufacturing"], buyBox: ["industrial", "warehouse", "manufacturing"], score: 20 }
  ];
  for (const type of zoningTypes) {
    const dealHasType = type.deal.some((keyword) => dealText.includes(keyword));
    const buyBoxHasType = type.buyBox.some((keyword) => buyBoxLower.includes(keyword));
    if (dealHasType && buyBoxHasType) {
      return type.score;
    }
  }
  const zoningKeywords = [
    "entitled",
    "zoning",
    "zoned",
    "raw land",
    "perk tested",
    "development ready",
    "permits",
    "utilities"
  ];
  let dealHasZoning = false;
  let buyBoxHasZoning = false;
  for (const keyword of zoningKeywords) {
    if (dealText.includes(keyword)) dealHasZoning = true;
    if (buyBoxLower.includes(keyword)) buyBoxHasZoning = true;
  }
  if (!buyBoxHasZoning) return 0;
  if (buyBoxLower.includes("does not require zoning") || buyBoxLower.includes("raw land")) {
    return 10;
  }
  if (buyBoxLower.includes("entitled") && dealText.includes("entitled")) {
    return 15;
  }
  if (dealHasZoning) {
    return 8;
  }
  return 0;
}
function calculateBuyerTypeScore(buyerType, dealDescription) {
  if (!buyerType || typeof buyerType !== "string") return 0;
  const dealText = (typeof dealDescription === "string" ? dealDescription : "").toLowerCase();
  if (buyerType === "Builder") {
    return 5;
  }
  if (buyerType === "Developer") {
    if (dealText.includes("50") || dealText.includes("100") || dealText.includes("units")) {
      return 5;
    }
    return 3;
  }
  if (buyerType === "Investor") {
    return 3;
  }
  return 0;
}
function isBusinessDeal(deal) {
  const title = (deal.title || "").toLowerCase();
  const description = (deal.description || "").toLowerCase();
  const businessKeywords = [
    "demolition",
    "contractor",
    "business acquisition",
    "company acquisition",
    "operations center",
    "corporate",
    "fortune 500",
    "ttm earnings",
    "cash-on-cash return",
    "profitable business"
  ];
  return businessKeywords.some(
    (keyword) => title.includes(keyword) || description.includes(keyword)
  );
}
function scoreDealContactMatch(deal, contact) {
  if (contact.buyer_type === "Builder" && isBusinessDeal(deal)) {
    return {
      contact,
      score: 0,
      matchBreakdown: {
        geographic: 0,
        acreage: 0,
        lotCount: 0,
        zoning: 0,
        buyerType: 0
      }
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
      buyerType
    }
  };
}
async function getAllDeals() {
  const { data, error } = await supabase.from("deals").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching deals:", error);
    throw new Error(`Failed to fetch deals: ${error.message}`);
  }
  return data || [];
}
async function getRecommendedBuyers(dealId) {
  const { data: dealData, error: dealError } = await supabase.from("deals").select("*").eq("id", dealId).single();
  if (dealError || !dealData) {
    console.error("Error fetching deal:", dealError);
    return null;
  }
  const { data: contactsData, error: contactsError } = await supabase.from("contacts").select("*").not("buy_box", "is", null);
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return null;
  }
  const contacts = contactsData || [];
  const matches = contacts.map((contact) => scoreDealContactMatch(dealData, contact)).filter((match) => match.score >= 25).sort((a, b) => b.score - a.score).slice(0, 5);
  return {
    deal: dealData,
    recommendedBuyers: matches
  };
}
async function getDealById(dealId) {
  const { data: dealData, error: dealError } = await supabase.from("deals").select(`
      *,
      source_contact:contacts!deals_contact_id_fkey(*)
    `).eq("id", dealId).single();
  if (dealError || !dealData) {
    console.error("Error fetching deal:", dealError);
    return null;
  }
  const { data: contactsData, error: contactsError } = await supabase.from("contacts").select("*").not("buy_box", "is", null);
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return null;
  }
  const contacts = contactsData || [];
  const matches = contacts.map((contact) => scoreDealContactMatch(dealData, contact)).filter((match) => match.score >= 25).sort((a, b) => b.score - a.score).slice(0, 5);
  return {
    deal: dealData,
    recommendedBuyers: matches,
    sourceContact: dealData.source_contact || null
  };
}
async function getAllDealsWithMatches() {
  const deals = await getAllDeals();
  const { data: contactsData, error: contactsError } = await supabase.from("contacts").select("*").not("buy_box", "is", null);
  if (contactsError) {
    console.error("Error fetching contacts:", contactsError);
    return [];
  }
  const contacts = contactsData || [];
  return deals.map((deal) => {
    const matches = contacts.map((contact) => scoreDealContactMatch(deal, contact)).filter((match) => match.score >= 25).sort((a, b) => b.score - a.score).slice(0, 5);
    return {
      deal,
      recommendedBuyers: matches
    };
  });
}
var init_dealMatching = __esm({
  "server/dealMatching.ts"() {
    "use strict";
    init_supabase();
  }
});

// server/interactions.ts
var interactions_exports = {};
__export(interactions_exports, {
  getInteractionsByContact: () => getInteractionsByContact,
  getInteractionsByDeal: () => getInteractionsByDeal,
  logInteraction: () => logInteraction,
  updateInteractionStatus: () => updateInteractionStatus
});
async function logInteraction(input) {
  const { data, error } = await supabase.from("interactions").insert({
    deal_id: input.dealId,
    contact_id: input.contactId,
    interaction_type: input.interactionType,
    status: input.status,
    notes: input.notes
  }).select().single();
  if (error) {
    throw new Error(`Failed to log interaction: ${error.message}`);
  }
  return data;
}
async function updateInteractionStatus(interactionId, status, notes) {
  const updateData = {
    status,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (notes) {
    updateData.notes = notes;
  }
  if (status === "interested" || status === "not_interested") {
    updateData.responded_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  const { data, error } = await supabase.from("interactions").update(updateData).eq("id", interactionId).select().single();
  if (error) {
    throw new Error(`Failed to update interaction: ${error.message}`);
  }
  return data;
}
async function getInteractionsByDeal(dealId) {
  const { data, error } = await supabase.from("interactions").select("*").eq("deal_id", dealId).order("sent_at", { ascending: false });
  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }
  return data || [];
}
async function getInteractionsByContact(contactId) {
  const { data, error } = await supabase.from("interactions").select("*").eq("contact_id", contactId).order("sent_at", { ascending: false });
  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }
  return data || [];
}
var init_interactions = __esm({
  "server/interactions.ts"() {
    "use strict";
    init_supabase();
  }
});

// api/index.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  deals: router({
    list: publicProcedure.query(async () => {
      const { getAllDeals: getAllDeals2 } = await Promise.resolve().then(() => (init_dealMatching(), dealMatching_exports));
      return getAllDeals2();
    }),
    listWithMatches: publicProcedure.query(async () => {
      const { getAllDealsWithMatches: getAllDealsWithMatches2 } = await Promise.resolve().then(() => (init_dealMatching(), dealMatching_exports));
      return getAllDealsWithMatches2();
    }),
    getById: publicProcedure.input(z2.object({ dealId: z2.string() })).query(async ({ input }) => {
      const { getDealById: getDealById2 } = await Promise.resolve().then(() => (init_dealMatching(), dealMatching_exports));
      return getDealById2(input.dealId);
    }),
    getRecommendedBuyers: publicProcedure.input(z2.object({ dealId: z2.string() })).query(async ({ input }) => {
      const { getRecommendedBuyers: getRecommendedBuyers2 } = await Promise.resolve().then(() => (init_dealMatching(), dealMatching_exports));
      return getRecommendedBuyers2(input.dealId);
    }),
    researchBuyers: publicProcedure.input(z2.object({ dealId: z2.number(), mode: z2.enum(["deep", "wide"]) })).mutation(async ({ input }) => {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      return {
        success: true,
        buyersFound: input.mode === "deep" ? 5 : 15,
        mode: input.mode
      };
    })
  }),
  contacts: router({
    list: publicProcedure.query(async () => {
      const { getAllContacts: getAllContacts2 } = await Promise.resolve().then(() => (init_supabase(), supabase_exports));
      return getAllContacts2();
    }),
    search: publicProcedure.input(
      z2.object({
        query: z2.string().optional(),
        market: z2.string().optional(),
        buyerType: z2.string().optional()
      })
    ).query(async ({ input }) => {
      const { searchContacts: searchContacts2 } = await Promise.resolve().then(() => (init_supabase(), supabase_exports));
      return searchContacts2(input.query || "", input.market, input.buyerType);
    }),
    getFilters: publicProcedure.query(async () => {
      const { getUniqueMarkets: getUniqueMarkets2, getUniqueBuyerTypes: getUniqueBuyerTypes2 } = await Promise.resolve().then(() => (init_supabase(), supabase_exports));
      const [markets, buyerTypes] = await Promise.all([
        getUniqueMarkets2(),
        getUniqueBuyerTypes2()
      ]);
      return { markets, buyerTypes };
    })
  }),
  interactions: router({
    logDealSubmission: publicProcedure.input(
      z2.object({
        dealId: z2.string(),
        contactId: z2.string(),
        notes: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { logInteraction: logInteraction2 } = await Promise.resolve().then(() => (init_interactions(), interactions_exports));
      return logInteraction2({
        dealId: input.dealId,
        contactId: input.contactId,
        interactionType: "email_sent",
        status: "pending",
        notes: input.notes
      });
    }),
    updateStatus: publicProcedure.input(
      z2.object({
        interactionId: z2.string(),
        status: z2.enum(["pending", "interested", "not_interested", "closed"]),
        notes: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { updateInteractionStatus: updateInteractionStatus2 } = await Promise.resolve().then(() => (init_interactions(), interactions_exports));
      return updateInteractionStatus2(input.interactionId, input.status, input.notes);
    }),
    getByDeal: publicProcedure.input(z2.object({ dealId: z2.string() })).query(async ({ input }) => {
      const { getInteractionsByDeal: getInteractionsByDeal2 } = await Promise.resolve().then(() => (init_interactions(), interactions_exports));
      return getInteractionsByDeal2(input.dealId);
    }),
    getByContact: publicProcedure.input(z2.object({ contactId: z2.string() })).query(async ({ input }) => {
      const { getInteractionsByContact: getInteractionsByContact2 } = await Promise.resolve().then(() => (init_interactions(), interactions_exports));
      return getInteractionsByContact2(input.contactId);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// api/index.ts
import path from "path";
import fs from "fs";
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var distPath = path.resolve(process.cwd(), "dist", "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  app.use("*", (_req, res) => {
    res.status(503).json({ error: "Frontend build not found. Run pnpm build first." });
  });
}
var index_default = app;
export {
  index_default as default
};
