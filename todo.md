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
