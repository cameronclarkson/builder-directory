import { db } from '../server/db.ts';
import { contacts } from '../drizzle/schema.ts';

const buyerData = [
  { name: "Kenny Gonzalez", status: "Interested", details: "Needs 50+ lots" },
  { name: "Krys Guillaume", status: "Interested (Future)", details: "Raw land for 2027+ closings" },
  { name: "Fadl Azzam", status: "Interested", details: "Requested available opportunities via email" },
  { name: "Ethan Alvare", status: "Interested", details: "Replied 'Yes' to off-market lot inquiry" },
  { name: "Nick Jones", status: "Interested", details: "Commercial $1M–$20M FL retail/industrial; some vacant land near major anchors" },
  { name: "Robert Lambert", status: "Interested", details: "20+ acres SE coast GA→FL; prefers 50+ finished contiguous lots" },
  { name: "De'Aunte Theall", status: "Interested", details: "30+ lots; target $48K–$72K per lot" },
  { name: "Jake Helmburg", status: "Possibly Interested", details: "Awaiting lot criteria" },
  { name: "John Dodd", status: "Warm", details: "Interested but not aggressive; Texas focus" },
  { name: "Christina Reece", status: "Warm", details: "Always looking; buy box requested" },
  { name: "Geoffrey Martin", status: "Interested", details: "Asked what off-market lots are available" },
  { name: "Maiza Della Rosa", status: "Not a Fit", details: "Only interested in subdivided lots" },
  { name: "Loila Mongas", status: "Not Now", details: "Off-market lots not current priority" },
  { name: "Lawrence Dean", status: "Not a Fit", details: "No longer in land/lot acquisitions" },
  { name: "Jeff Barry", status: "Indirect", details: "Recruiter; clients may be buyers" },
  { name: "Dr. Christopher Zambakari", status: "Not Now", details: "Not looking currently" },
  { name: "David Edlund", status: "Selective", details: "Only strong infill in DFW" },
  { name: "Matthew R. Nichols", status: "Not Now", details: "Paused acquisitions due to job change" },
  { name: "Maddie Harper", status: "Not a Fit", details: "Now an agent; not buying lots" },
  { name: "Lauren Noonan", status: "Not Interested", details: "Declined" },
  { name: "Karen Spencer", status: "Other", details: "Personal update unrelated to land" },
  { name: "Eric Erickson", status: "Neutral", details: "Replied 'Sounds good'; no criteria provided" },
];

async function importBuyers() {
  console.log('Starting buyer import...');
  
  for (const buyer of buyerData) {
    try {
      // Extract buyer type and market from details
      let buyerType = 'Builder'; // Default
      let market = 'Georgia'; // Default
      let minLots = null;
      let maxPrice = null;
      
      // Parse details for criteria
      if (buyer.details.includes('50+ lots')) {
        minLots = 50;
      } else if (buyer.details.includes('30+ lots')) {
        minLots = 30;
      } else if (buyer.details.includes('20+ acres')) {
        minLots = 20;
      }
      
      if (buyer.details.includes('$48K–$72K')) {
        maxPrice = 72000;
      } else if (buyer.details.includes('$1M–$20M')) {
        buyerType = 'Commercial Developer';
        maxPrice = 20000000;
      }
      
      if (buyer.details.includes('Texas')) {
        market = 'Texas';
      } else if (buyer.details.includes('DFW')) {
        market = 'Texas';
      } else if (buyer.details.includes('FL') || buyer.details.includes('Florida')) {
        market = 'Florida';
      } else if (buyer.details.includes('GA') || buyer.details.includes('Georgia')) {
        market = 'Georgia';
      }
      
      // Only import interested/warm buyers
      if (['Interested', 'Interested (Future)', 'Possibly Interested', 'Warm'].includes(buyer.status)) {
        await db.insert(contacts).values({
          name: buyer.name,
          email: `${buyer.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`, // Placeholder
          buyerType,
          company: buyer.name, // Use name as company placeholder
          market,
          minLots,
          maxPrice,
          notes: `Status: ${buyer.status}. ${buyer.details}`,
        }).onConflictDoNothing();
        
        console.log(`✓ Imported: ${buyer.name} (${buyer.status})`);
      } else {
        console.log(`⊘ Skipped: ${buyer.name} (${buyer.status} - not active)`);
      }
    } catch (error) {
      console.error(`✗ Error importing ${buyer.name}:`, error.message);
    }
  }
  
  console.log('Import complete!');
  process.exit(0);
}

importBuyers().catch(console.error);
