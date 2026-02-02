export interface BuyerProfile {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  market: string | null;
  buy_box: string | null;
  notes: string | null;
  created_at: string;
}
