import { supabase } from "../server/supabase";

async function run() {
  const { data, error } = await supabase
    .from("contacts")
    .select("market")
    .not("market", "is", null);

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  const markets = Array.from(new Set(data.map(d => d.market))).sort();
  console.log("Current markets:");
  markets.forEach(m => console.log(`- "${m}"`));
}

run();