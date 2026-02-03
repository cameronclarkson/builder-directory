import { describe, expect, it, beforeAll } from "vitest";
import { logInteraction, updateInteractionStatus, getInteractionsByDeal, getInteractionsByContact } from "./interactions";
import { supabase } from "./supabase";

describe("interactions tracking", () => {
  let testDealId: string | null = null;
  let testContactId: string | null = null;
  let testInteractionId: string | null = null;

  beforeAll(async () => {
    // Fetch a real deal and contact from the database for testing
    const { data: deals } = await supabase
      .from("deals")
      .select("id")
      .limit(1);
    
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id")
      .limit(1);

    if (deals && deals.length > 0) {
      testDealId = deals[0].id;
    }

    if (contacts && contacts.length > 0) {
      testContactId = contacts[0].id;
    }
  });

  it("should log a new deal submission interaction", async () => {
    if (!testDealId || !testContactId) {
      console.log("Skipping test: no deals or contacts in database");
      return;
    }

    const interaction = await logInteraction({
      dealId: testDealId,
      contactId: testContactId,
      interactionType: "email_sent",
      status: "pending",
      notes: "Test interaction - sent initial deal package",
    });

    expect(interaction).toBeDefined();
    expect(interaction.deal_id).toBe(testDealId);
    expect(interaction.contact_id).toBe(testContactId);
    expect(interaction.interaction_type).toBe("email_sent");
    expect(interaction.status).toBe("pending");

    testInteractionId = interaction.id;
  });

  it("should update interaction status to interested", async () => {
    if (!testInteractionId) {
      console.log("Skipping test: no interaction created");
      return;
    }

    const updated = await updateInteractionStatus(
      testInteractionId,
      "interested",
      "Test update - buyer requested more details"
    );

    expect(updated).toBeDefined();
    expect(updated.status).toBe("interested");
    expect(updated.responded_at).toBeDefined();
  });

  it("should retrieve interactions by deal", async () => {
    if (!testDealId) {
      console.log("Skipping test: no deal ID available");
      return;
    }

    const interactions = await getInteractionsByDeal(testDealId);
    
    expect(Array.isArray(interactions)).toBe(true);
    if (testInteractionId) {
      const found = interactions.find(i => i.id === testInteractionId);
      expect(found).toBeDefined();
    }
  });

  it("should retrieve interactions by contact", async () => {
    if (!testContactId) {
      console.log("Skipping test: no contact ID available");
      return;
    }

    const interactions = await getInteractionsByContact(testContactId);
    
    expect(Array.isArray(interactions)).toBe(true);
    if (testInteractionId) {
      const found = interactions.find(i => i.id === testInteractionId);
      expect(found).toBeDefined();
    }
  });

  it("should handle updating status to not_interested", async () => {
    if (!testInteractionId) {
      console.log("Skipping test: no interaction created");
      return;
    }

    const updated = await updateInteractionStatus(
      testInteractionId,
      "not_interested",
      "Test update - buyer passed on this opportunity"
    );

    expect(updated).toBeDefined();
    expect(updated.status).toBe("not_interested");
    expect(updated.responded_at).toBeDefined();
  });
});
