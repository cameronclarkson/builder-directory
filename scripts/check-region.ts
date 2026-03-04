import { supabase } from "../server/supabase";

async function run() {
  const { data, error } = await supabase
    .from("contacts")
    .select("region")
    .limit(1);

  if (error) {
    console.log("Column region does not exist or error:", error.message);
  } else {
    console.log("Column region exists.");
  }
}

run();