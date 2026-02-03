import { supabase } from "./supabase";

export interface Interaction {
  id: string;
  deal_id: string;
  contact_id: string;
  interaction_type: string;
  status: string;
  notes?: string;
  sent_at: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LogInteractionInput {
  dealId: string;
  contactId: string;
  interactionType: string;
  status: string;
  notes?: string;
}

export async function logInteraction(input: LogInteractionInput): Promise<Interaction> {
  // Using imported supabase client
  
  const { data, error } = await supabase
    .from("interactions")
    .insert({
      deal_id: input.dealId,
      contact_id: input.contactId,
      interaction_type: input.interactionType,
      status: input.status,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to log interaction: ${error.message}`);
  }

  return data;
}

export async function updateInteractionStatus(
  interactionId: string,
  status: string,
  notes?: string
): Promise<Interaction> {
  // Using imported supabase client
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updateData.notes = notes;
  }

  if (status === "interested" || status === "not_interested") {
    updateData.responded_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("interactions")
    .update(updateData)
    .eq("id", interactionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update interaction: ${error.message}`);
  }

  return data;
}

export async function getInteractionsByDeal(dealId: string): Promise<Interaction[]> {
  // Using imported supabase client
  
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("deal_id", dealId)
    .order("sent_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }

  return data || [];
}

export async function getInteractionsByContact(contactId: string): Promise<Interaction[]> {
  // Using imported supabase client
  
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("contact_id", contactId)
    .order("sent_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get interactions: ${error.message}`);
  }

  return data || [];
}
