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
