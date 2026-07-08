P0 — Critical Integration & Data Correctness

Task 1: Fix Stage 1 manual status location update





Goal: Keep Package.currentLocation in sync when front office applies status.



Files: stage1-courier-app/backend/src/services/package.service.ts



Backend: Add currentLocation: location to package update in updatePackageStatusByTrackingId.



Frontend: None.



Database: None.



Acceptance criteria: After PATCH, GET /packages/:id returns updated currentLocation; status history still created.



Commit: fix(stage1): sync currentLocation on manual status update

Task 2: Return 404 instead of 500 for missing Stage 1 packages





Goal: Proper HTTP semantics for not-found on PATCH and consistent error handling foundation.



Files: stage1-courier-app/backend/src/errors/app.error.ts (new), stage1-courier-app/backend/src/services/package.service.ts, stage1-courier-app/backend/src/controllers/package.controller.ts, stage1-courier-app/backend/src/app.ts



Backend: Introduce AppError; throw NOT_FOUND from service; add error middleware handler.



Frontend: None.



Database: None.



Acceptance criteria: PATCH /packages/unknown → 404 with structured body; delivered-package error → 409 or 400, not 500.



Commit: fix(stage1): add AppError and return 404 for missing packages

Task 3: Add ETL failure retry on collection side





Goal: Failed raw updates should retry, not be permanently marked processed.



Files: stage1-courier-app/backend/src/services/raw-update.service.ts, stage1-courier-app/backend/prisma/schema.prisma



Backend: Add attempts, maxAttempts, nextAttemptAt to RawUpdate (or separate failed queue); only mark processed: true on success or max retries.



Frontend: None.



Database: Migration adding retry columns to raw_updates.



Acceptance criteria: Simulated DB failure retries; permanent failure after max attempts with error populated.



Commit: feat(stage1): add retry support for raw update ETL processing

Task 4: Persist ETL push offset in logistics app





Goal: Survive restarts without duplicate pushes to Stage 1.



Files: stage2-logistics-app/backend/prisma/schema.prisma, stage2-logistics-app/backend/src/services/package.service.ts



Backend: Add EtlPushOffset model (single row: lastPushedAt); read/write instead of in-memory variable.



Frontend: None.



Database: New migration for offset table.



Acceptance criteria: Restart logistics app; no re-push of already-sent PackageHistory rows.



Commit: feat(stage2): persist ETL push offset across restarts

Task 5: Add updateId deduplication in collection ETL





Goal: Idempotent ETL ingestion when logistics re-sends updates.



Files: stage1-courier-app/backend/prisma/schema.prisma, stage1-courier-app/backend/src/validators/raw-update.validator.ts, stage1-courier-app/backend/src/services/raw-update.service.ts



Backend: Accept optional updateId; store processed IDs; skip duplicates.



Frontend: None.



Database: Migration: processed_etl_updates table or unique index on updateId.



Acceptance criteria: Same updateId posted twice → second ignored; package status unchanged.



Commit: feat(stage1): deduplicate ETL updates by updateId



P1 — Complete Stage 3 Integration

Task 6: Configurable logistics webhook URL for registration





Goal: Registration works outside localhost.



Files: stage2-logistics-app/backend/src/services/stage1-registration.service.ts, stage2-logistics-app/backend/.env.example



Backend: Use LOGISTICS_WEBHOOK_PUBLIC_URL env, fallback to localhost.



Frontend: None.



Database: None.



Acceptance criteria: Registration PUT sends correct public URL when env set.



Commit: fix(stage2): use configurable public webhook URL for stage1 registration

Task 7: Fix ETL push auth env fallback and enable dev interval





Goal: Correct auth config; support 1-minute dev interval per architecture.



Files: stage2-logistics-app/backend/src/services/package.service.ts, stage2-logistics-app/backend/src/services/etl.service.ts, .env.example files



Backend: Fix duplicate env read; document ETL_PUSH_INTERVAL_MS=60000 for dev; add ETL push retry on failure (exponential backoff, 3 attempts per run).



Frontend: None.



Database: None.



Acceptance criteria: ETL push retries on 502; dev env runs every 60s when configured.



Commit: fix(stage2): correct ETL auth config and add push retry

Task 8: Strip internal fields in collection ETL ingestion





Goal: Collection stores only customer-safe fields; reject/strip sourceStatus.



Files: stage1-courier-app/backend/src/validators/raw-update.validator.ts, stage1-courier-app/backend/src/services/raw-update.service.ts



Backend: Remove .passthrough(); explicitly allow only trackingId, status, location, timestamp, updateId.



Frontend: None.



Database: None.



Acceptance criteria: Payload with sourceStatus is stripped before storage; internal status never written to package tables.



Commit: fix(stage1): strip internal ETL fields at ingestion boundary

Task 9: Map logistics terminal state to DELIVERED





Goal: Customer sees DELIVERED when package completes delivery workflow.



Files: stage2-logistics-app/backend/src/services/package.service.ts, optionally logistics status enum if new terminal state needed



Backend: Either add DELIVERED to logistics enum + transition from OUT_FOR_DELIVERY, or map OUT_FOR_DELIVERY → Stage 1 DELIVERED with explicit delivery confirmation action.



Frontend: None (logistics status button may need label tweak).



Database: Possible enum migration if adding DELIVERED to logistics.



Acceptance criteria: End-to-end: logistics completes delivery → Stage 1 package shows DELIVERED.



Commit: feat(integration): map completed delivery to DELIVERED in stage1

Task 10: Secure integration registration endpoints





Goal: Prevent unauthenticated read/write of webhook credentials.



Files: stage1-courier-app/backend/src/routes/integration.routes.ts, new middleware, stage1-courier-app/backend/src/controllers/integration.controller.ts



Backend: Add x-integration-admin-key middleware; mask API key on GET (show last 4 chars only).



Frontend: None.



Database: None.



Acceptance criteria: Unauthenticated PUT/GET → 401; GET never returns full API key.



Commit: feat(stage1): protect logistics webhook registration endpoints



P2 — Architecture Feature Gaps (Stage 1)

Task 11: Seed CREATED status history on package create





Goal: Tracking history starts at creation.



Files: stage1-courier-app/backend/src/services/package.service.ts



Backend: Create initial statusHistory row with CREATED in same transaction as package create.



Frontend: None.



Database: None.



Acceptance criteria: New package immediately has one history entry; timeline shows CREATED.



Commit: feat(stage1): record CREATED status history on package creation

Task 12: Expand Stage 1 dashboard with operational sections





Goal: Match architecture: waiting pickup, in transit, delayed packages.



Files: stage1-courier-app/backend/src/services/dashboard.service.ts, stage1-courier-app/frontend/src/pages/Dashboard/index.tsx, stage1-courier-app/frontend/src/types/package.types.ts



Backend: Add sections query (CREATED = waiting pickup; IN_TRANSIT + OUT_FOR_DELIVERY = in transit; delayed = created > 24h or configurable).



Frontend: Render section lists similar to Stage 2 dashboard.



Database: None.



Acceptance criteria: Dashboard shows counts + package lists per section; links to detail pages work.



Commit: feat(stage1): add operational dashboard sections

Task 13: Public tracking page with captcha





Goal: Customer-facing tracking without auth.



Files: New stage1-courier-app/frontend/src/pages/PublicTracking/, stage1-courier-app/backend/src/routes/package.routes.ts, new GET /public/track/:trackingId controller, stage1-courier-app/frontend/src/routes.tsx



Backend: Public endpoint returning only customer-safe fields (status, region, delay flag); no sale/internal data; optional simple captcha token validation middleware.



Frontend: /track page with tracking ID input, captcha widget, results card.



Database: None (or captcha session store if server-side).



Acceptance criteria: Customer can track by ID + captcha; response excludes internal fields; invalid captcha blocked.



Commit: feat(stage1): add public tracking page with captcha

Task 14: Sale information capture





Goal: Implement sale details per architecture.



Files: stage1-courier-app/backend/src/services/package.service.ts, stage1-courier-app/backend/src/validators/package.validator.ts, stage1-courier-app/frontend/src/pages/CreatePackage/index.tsx



Backend: Accept optional saleAmount on create; create Sale record in transaction.



Frontend: Add amount field to create form; show on package detail.



Database: None (table exists).



Acceptance criteria: Create package with amount → sale relation populated; visible on detail page.



Commit: feat(stage1): capture and display sale information



P3 — Code Quality & Frontend Polish

Task 15: Standardize Stage 1 API response wrappers





Goal: Align with AGENTS.md and Stage 2 conventions.



Files: All Stage 1 controllers, stage1-courier-app/frontend/src/services/package.service.ts, hooks



Backend: Use { error, message, data } consistently via helper.



Frontend: Update service layer to read unified shape.



Database: None.



Acceptance criteria: All Stage 1 endpoints return same envelope; frontend still works.



Commit: refactor(stage1): standardize API response wrappers

Task 16: Fix Stage 1 frontend env config and types





Goal: Use VITE_API_URL; fix dashboard type mismatch.



Files: stage1-courier-app/frontend/src/lib/axios.ts, stage1-courier-app/frontend/src/types/package.types.ts, stage1-courier-app/frontend/README.md



Backend: None.



Frontend: Read env var; align DashboardData with API.



Database: None.



Acceptance criteria: Frontend connects via env; no TS errors on dashboard types.



Commit: fix(stage1-fe): use VITE_API_URL and correct dashboard types

Task 17: Fix Stage 2 CreateBag/CreateTruck response handling





Goal: Show correct success IDs.



Files: stage2-logistics-app/frontend/src/pages/CreateBag/index.tsx, stage2-logistics-app/frontend/src/pages/CreateTruck/index.tsx



Backend: None.



Frontend: Read data.data.id; add error display parity.



Database: None.



Acceptance criteria: Success message shows real bag/truck ID.



Commit: fix(stage2-fe): correct create bag/truck success message

Task 18: Add regions dropdown to logistics create package





Goal: Prevent invalid region code typos.



Files: stage2-logistics-app/frontend/src/pages/CreatePackage/index.tsx, new useRegions hook, stage2-logistics-app/frontend/src/services/



Backend: None (uses existing GET /regions).



Frontend: Fetch regions; render select inputs.



Database: None.



Acceptance criteria: Create package form uses seeded region codes; 400 on invalid region eliminated in normal use.



Commit: feat(stage2-fe): use regions API in create package form



P4 — Logistics Workflow Hardening

Task 19: Enforce status prerequisites on bag/truck assignment





Goal: Prevent status/assignment inconsistency.



Files: stage2-logistics-app/backend/src/services/bag.service.ts, stage2-logistics-app/backend/src/services/truck.service.ts



Backend: Validate package is PICKED_UP before bag assign; bag has packages in ADDED_TO_BAG before truck assign; reject invalid overwrites.



Frontend: Surface 409 errors on assign pages.



Database: None.



Acceptance criteria: Cannot assign TO_BE_PICKED_UP package to bag; cannot load empty bag on truck.



Commit: fix(stage2): enforce status prerequisites on assignments

Task 20: Invalidate React Query cache on assign pages





Goal: UI reflects assignment without manual refresh.



Files: stage2-logistics-app/frontend/src/pages/AssignPackage/index.tsx, stage2-logistics-app/frontend/src/pages/AssignBag/index.tsx



Backend: None.



Frontend: Invalidate packages/bags/trucks queries; remove debug console.log.



Database: None.



Acceptance criteria: After assign, lists and dashboard update automatically.



Commit: fix(stage2-fe): refresh caches after assignment actions



P5 — Reliability & Testing

Task 21: Graceful worker shutdown





Goal: Clean shutdown on SIGTERM for both apps.



Files: stage1-courier-app/backend/src/index.ts, stage2-logistics-app/backend/src/index.ts, ETL/outbox service files



Backend: Wire stopWebhookOutboxWorker, stopPushEtlJob, add stopRawUpdatesEtlJob.



Frontend: None.



Database: None.



Acceptance criteria: SIGTERM stops intervals; in-flight item completes or marks retry.



Commit: feat: add graceful shutdown for background workers

Task 22: Integration smoke test — webhook round trip





Goal: Automated verification of Stage 3 webhook flow.



Files: New stage1-courier-app/backend/tests/webhook-integration.test.ts (or shared tests/), test harness with vitest/jest



Backend: Test: create package → outbox processes → logistics queue creates package (mock or test DB).



Frontend: None.



Database: Test database fixtures.



Acceptance criteria: CI-runnable test passes locally; documents required env vars.



Commit: test(integration): add webhook round-trip smoke test

Task 23: Integration smoke test — ETL sync





Goal: Automated verification of status push + collection processing.



Files: New integration test file in either app



Backend: Test: logistics status change → ETL push → collection raw update processed → package status updated.



Frontend: None.



Database: Test DB.



Acceptance criteria: End-to-end status sync test passes with dedup.



Commit: test(integration): add ETL sync smoke test



P6 — Cleanup (low priority, batchable)

Task 24: Remove dead code and fix naming typos





Goal: Reduce maintenance burden.



Files: dasboard.routes.ts (rename), PackageTable.tsx, frontend/src/app/routes.tsx, mobile nav stubs



Backend: Rename dashboard route file.



Frontend: Delete unused stubs or implement minimal mobile nav.



Database: None.



Acceptance criteria: No unused route files; dashboard routes still mount.



Commit: chore: remove dead code and fix dashboard route typo

Task 25: Reconcile roadmap.md with architecture.md





Goal: Single source of truth for stage boundaries.



Files: [roadmap.md](/home/parvathyg/Documents/Courrier Application/roadmap.md), docs/architecture.md



Backend: None.



Frontend: None.



Database: None.



Acceptance criteria: Both docs agree on Stage 3 (webhook + ETL) vs Stage 4 (production).



Commit: docs: align roadmap stage definitions with architecture