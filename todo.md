# Builder Directory TODO

## Database & Backend
- [x] Create contacts table in Drizzle schema (synced with Supabase)
- [x] Add tRPC procedure to fetch all contacts
- [x] Add tRPC procedure to search/filter contacts by name, company, email, focus
- [x] Add tRPC procedure to filter by status and focus

## Frontend - Search & Filter
- [x] Build search input component
- [x] Build status filter dropdown
- [x] Build focus filter dropdown
- [x] Implement search logic (name, company, email, focus)
- [x] Implement filter logic (status, focus)
- [x] Add clear filters button

## Frontend - Display
- [x] Build contact card component showing name, company, email, phone, website, business, status, focus
- [x] Build contact detail view showing target markets, buy box, next action, follow-up date
- [x] Create responsive grid/list layout
- [x] Add empty state handling

## Design & Styling
- [x] Configure Scandinavian minimalist color palette (pale cool gray, soft pastel blue, blush pink)
- [x] Apply bold black sans-serif typography
- [x] Add geometric shapes/decorative elements
- [x] Ensure responsive design across devices
- [ ] Test color contrast and readability

## Testing & Delivery
- [x] Write vitest tests for search/filter logic
- [x] Test all filter combinations
- [x] Verify Supabase connection and data loading
- [x] Create checkpoint and prepare for delivery

## Phase 2 - Buyer Profiles Integration
- [x] Add tRPC procedure to fetch buyer profiles from Supabase
- [x] Create Buyers tab/section in directory
- [x] Build buyer profile card component
- [x] Add buyer search and filtering (by company, market, focus)
- [ ] Create side-by-side view of contacts and buyers
- [ ] Add deal-to-buyer matching logic
- [x] Test buyer profile display and search
- [x] Update checkpoint with buyer profiles feature

## Phase 3 - Consolidate to Unified Buyers Directory
- [x] Migrate contacts table data to buyer_profiles table
- [x] Add buyer_type field (Builder, Developer, Investor) to buyer_profiles
- [x] Update tRPC procedures to use unified buyers table
- [x] Remove separate contacts router
- [x] Update UI to single directory with buyer_type filter
- [x] Remove separate Directory and Buyers pages
- [x] Create unified Buyers page with type filtering
- [x] Update Home page navigation
- [x] Test unified directory search and filtering
- [x] Create checkpoint with consolidated directory

## Phase 4 - LinkedIn Contacts Import & Overlap Analysis
- [x] Extract LinkedIn contact data from PDF into structured format
- [x] Query existing Supabase buyers to identify potential duplicates
- [x] Match LinkedIn contacts with existing buyers by name/company/email
- [x] Import new LinkedIn contacts not in database
- [x] Update existing buyer profiles with enriched buy box data from LinkedIn
- [x] Generate overlap analysis report showing duplicates and new contacts
- [x] Update directory UI to reflect new contacts

## Phase 5 - Consolidate buyer_profiles into contacts
- [x] Analyze schema differences between contacts and buyer_profiles tables
- [x] Migrate all buyer_profiles data to contacts table
- [x] Identify duplicate contacts by name/email/company
- [x] Remove duplicate contacts keeping the most complete record
- [x] Update backend queries to use contacts table
- [x] Update tRPC routers to use contacts instead of buyer_profiles
- [x] Delete buyer_profiles table
- [x] Test directory with consolidated contacts table
- [x] Create checkpoint with consolidated data

## Phase 6 - Deal-Matching Engine
- [x] Analyze deals table schema and sample data
- [x] Extract key matching criteria from contact buy_box fields
- [x] Design scoring algorithm (location, acreage, zoning, price range, buyer type)
- [x] Build backend matching service to score deals against contacts
- [x] Create tRPC procedure to get deals with recommended buyers
- [x] Build Deals page UI to display all deals
- [x] Add deal cards showing top 3-5 recommended buyers per deal
- [x] Add deal detail view with full buyer recommendations and scores
- [x] Add filtering by deal stage, type, location
- [x] Write vitest tests for matching algorithm
- [x] Test deal-matching UI and verify recommendations
- [x] Create checkpoint with deal-matching engine


## Phase 7 - Enrich Contact Buy_Box Data
- [x] Extract 67 contacts with missing buy_box data
- [x] Research 19 major builder companies and generate realistic buy_box criteria
- [x] Update Supabase with enriched buy_box for all major builders
- [x] Verify deal-matching improvements with enriched data
- [x] Test buyer recommendations on Georgia deals


## Phase 8 - Research Unknown Contacts & Delete Non-Responsive
- [x] Research Boone Nerren (Texas Developer)
- [x] Research Jose Mota (Miami Developer)
- [x] Research Shauna Newlun (Colorado Builder)
- [x] Research Lou Weilacher (North Carolina Builder)
- [x] Research Micah Utt (Carolinas/Savannah Builder)
- [x] Research Tony Hounshell (Nationwide Investor)
- [x] Research Melvin Rose Jr (Georgia Investor)
- [x] Research Mike Michael (Builder)
- [x] Research other Unknown contacts with available market data
- [x] Delete all contacts who responded "no" to LinkedIn outreach
- [x] Update deals foreign keys before deletion

## Phase 9 - Email Outreach & Interactions Tracking
- [x] Create interactions table in Supabase
- [x] Add tRPC procedures for logging deal submissions
- [x] Build "Send to Buyer" button on deal cards
- [x] Create email template with deal details pre-populated
- [ ] Add interactions history view for each buyer
- [ ] Build conversion rate tracking dashboard
- [x] Test email outreach functionality
- [x] Create checkpoint with email + tracking features


## Bug Fix - Deal Matching Error
- [x] Investigate "text.match is not a function" error in dealMatching.ts
- [x] Add null/undefined checks for text fields before calling .match()
- [x] Test deal-matching on /deals page
- [x] Create checkpoint with bug fix


## Phase 10 - Deal Enrichment & Matching Improvement
- [x] Analyze current deals data structure and identify missing fields
- [x] Enrich deals with detailed property information (acreage, zoning, lot count, utilities)
- [x] Improve matching algorithm to handle edge cases and partial data
- [x] Add weighted scoring for different match criteria
- [x] Generate buyer recommendations for all 50 deals
- [x] Create deal-buyer match report
- [x] Test improved matching algorithm
- [x] Create checkpoint with enriched deals and improved matching


## Phase 11 - Filter Business Deals from Builder Matches
- [x] Identify business deals in database (vs land/real estate deals)
- [x] Update matching algorithm to exclude business deals for builders
- [x] Only show business deals to investors and developers
- [x] Add deal_type field logic to scoreDealContactMatch
- [x] Test that builders only see real estate deals
- [x] Create checkpoint with deal type filtering


## Phase 12 - Deal Detail View & Source Attribution
- [x] Check deals table schema for contact_id field
- [x] Query deals to identify those missing contact source
- [x] Assign contacts to deals based on location/type
- [x] Build deal detail page component
- [x] Add route for /deals/:id
- [x] Display full deal information with buyer recommendations
- [x] Show source contact information
- [ ] Add edit functionality for deal details
- [x] Test deal detail view
- [x] Create checkpoint with deal detail view


## Phase 13 - SaaS Navigation & Usability Improvements
- [x] Implement persistent sidebar navigation with collapsible drawer on mobile
- [x] Add top navigation bar with app branding and user actions
- [x] Create navigation component that works across all pages (Home, Buyers, Deals, DealDetail)
- [x] Add breadcrumbs to Deals and DealDetail pages for wayfinding
- [x] Add back button to DealDetail page
- [ ] Improve mobile responsiveness with Tailwind breakpoints (sm, md, lg, xl)
- [ ] Add keyboard navigation support (Tab, Escape, Enter)
- [ ] Add ARIA labels and semantic HTML for accessibility
- [ ] Ensure all touch targets are 44px minimum
- [ ] Test navigation on mobile, tablet, and desktop devices
- [ ] Verify color contrast meets WCAG AA standards
- [ ] Create checkpoint with improved navigation
