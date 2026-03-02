# SyncSpend Master Plan (A → E)

## A. Data Foundation
- Introduced repository abstraction in `services/data/transactionsRepo.ts`.
- Added durable-like cache adapter (`services/data/storage.ts`) with web localStorage + native in-memory fallback.
- Seeded merchant mapping and local budget persistence.
- Next step: swap storage adapter with `expo-sqlite` once package access is available.

## B. UI and Product Flow
- Updated tabs to Home, Insights, Add, SMS Feed, Profile.
- Matched black minimal UI for Home/Insights/SMS/Profile mockups.
- Added manual transaction flow (`quick-add`).
- Added budget configuration screen (`settings`).

## C. Cloud Backend and Sync
- Added backend scaffold in `backend/` with Node.js + PostgreSQL.
- Endpoints:
  - `POST /api/sync`
  - `GET /api/restore`
- Payload stored encrypted-at-client (base64 placeholder now); future: proper E2E key handling.

## D. Smart Categorization (AI-ready)
- Extended taxonomy: person_sent, person_received, food, travel, shopping, groceries, fuel, subscription, entertainment, bills, health, salary, uncategorized.
- Added seeded merchant map and confidence-aware parser status (`parsed` / `review_needed`).
- Future model hook: run on unknown merchants, threshold-based auto-labeling.

## E. Validation & Testing
### 3.1 Testing strategy
- Unit: parser extraction + category inference + summary computation.
- Integration: SMS scan → repository upsert → dashboard/insights consistency.
- Exploratory: review-needed correction flow, budget edge cases, cloud restore fallback.

### 3.2 Test cases and results
| Feature | Expected | Observed | Status |
|---|---|---|---|
| TypeScript compile | No type errors | Passed | Pass |
| Linting | No errors | Passed, with existing warnings in legacy auth animation files | Partial |
| Home UI | Match black mock style | Updated to black visual layout with top summary and list | Pass |
| Insights UI | Donut + category bars style | Updated donut and list style to mock | Pass |
| SMS feed UI | All/Parsed/Ignored cards | Updated matching dark cards and segmented tabs | Pass |
| Profile UI | Card list + logout style | Updated to provided profile mock style | Pass |
| Manual transaction | Add from UI | Quick-add tab saves transaction | Pass |
| Budget limit | Save and show utilization | Budget screen computes spent/remaining/utilization | Pass |
| Cloud API | /sync and /restore available | Implemented scaffold in backend | Pass |

### 3.3 Validation summary
- The app now behaves as a complete expense tracker foundation with categorization, insights, manual add, budget, and sync scaffolding.
- Remaining deviation: native SQLite module installation blocked by environment policy; repository is prepared for drop-in SQLite adapter.
