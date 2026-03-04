import { supabase } from "../server/supabase";

const mapping: Record<string, string> = {
  "": "Unknown",
  "Unknown": "Unknown",
  "Atlanta": "Southeast - Atlanta, GA",
  "Atlanta Metro": "Southeast - Atlanta, GA",
  "Atlanta, GA": "Southeast - Atlanta, GA",
  "East Point": "Southeast - Atlanta, GA",
  "Carolinas, Savannah/Coastal Georgia, South Carolina border": "Southeast - Coastal GA/SC",
  "Charlotte, NC metropolitan area": "Southeast - Charlotte, NC",
  "North Carolina (I-95 corridor)": "Southeast - Eastern NC",
  "Florida": "Southeast - Florida",
  "Miami (Dade County)": "Southeast - Miami, FL",
  "Georgia": "Southeast - Georgia",
  "Southeast": "Southeast - Regional",
  "Southeast USA": "Southeast - Regional",
  "Colorado": "West - Colorado",
  "Texas": "Southwest - Texas",
  "Ohio": "Midwest - Ohio",
  "U.S. (nationwide)": "Nationwide"
};

async function run() {
  // Let's get all data without limit
  let allData = [];
  let page = 0;
  while (true) {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, market")
      .range(page * 1000, (page + 1) * 1000 - 1);
    
    if (error) {
      console.error("Error:", error);
      break;
    }
    
    if (data.length === 0) break;
    allData = allData.concat(data);
    page++;
  }

  let updatedCount = 0;
  for (const contact of allData) {
    if (contact.market === null) continue;
    const market = contact.market.trim();
    const newMarket = mapping[market] || market;
    
    if (newMarket !== market) {
      console.log(`Updating ${market} -> ${newMarket} for contact ${contact.id}`);
      const { error: updateError } = await supabase
        .from("contacts")
        .update({ market: newMarket })
        .eq("id", contact.id);
        
      if (updateError) {
        console.error("Failed to update:", updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`Finished updating ${updatedCount} markets.`);
}

run();