# Project Ace: Technical Project Tracker

## Phase 1 (MVP)

- [ ] Setup Python/FastAPI environment and create the SQLAlchemy `Drills` model.
- [ ] Implement the `generate_smart_options()` logic in the seed script.
- [ ] Run the "Big Bang" seed script to populate ~9,000 math questions.
- [ ] Implement the `GET /api/drills/math` endpoint with `func.random()` ordering.
- [ ] Handle the `ValueError` for invalid difficulty levels (HTTP 400).

## Phase 2 (Gym)

- [ ] Implement JWT Authentication (`/register`, `/login`).
- [ ] Update the database with `User` and `DrillAttempt` models.
- [ ] Secure the `POST /api/drills/submit` endpoint with token validation.
- [ ] Build the Next.js `/dashboard` to display speed/score charts from user history.

## Phase 3 (Content Engine)

- [ ] Add an `is_admin` column to the `User` model.
- [ ] Implement the Admin Auth dependency for FastAPI (role-gating).
- [ ] Build the `POST /api/admin/generate-questions` endpoint.
- [ ] Implement the AI generation script using the Gemini API to output questions directly into the database.
- [ ] Build the simple Admin UI in Next.js (`/admin`).

## Phase 4 (Mock Exam)

- [ ] Create the `MockExamResult` data model.
- [ ] Build the complex `GET /api/exam/start` endpoint (fetches mixed categories).
- [ ] Build the `/exam` page with strict countdown timer logic and multi-section navigation.

## Phase 5 (AI Tutor)

- [ ] Build the secure `POST /api/explain` endpoint.
- [ ] Implement the specific AI prompt logic (No RAG, context-aware explanation based on correct/user answer).
- [ ] Build the "💡 Explain" button on the Next.js results page to trigger the API and show the modal explanation.
