export interface Contact {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  business: string | null;
  status: string | null;
  focus: string | null;
  target_markets: string[] | null;
  buy_box: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  created_at: string;
}
