# P2_SEED_DATA_CONTRACT — Seed Strategy & Demo Scenarios

## 1. Overview

This document specifies the rules, idempotency requirements, targets, and demo scenario for Person 2's database seed data.

---

## 2. Seed Execution Principles

1. **Idempotency**: Running the seed script multiple times MUST produce the exact same database state without throwing duplicate key errors or creating duplicate documents.
2. **Upsert Pattern**: Use Mongoose `bulkWrite` with `updateOne({ slug }, { $set: data }, { upsert: true })` or `findOneAndUpdate`.
3. **Non-Destructive**: Do NOT use `db.dropDatabase()` or `Collection.deleteMany({})` in production seed scripts. Preserve valid student data.
4. **Stable Identifiers**: Use stable string `slug` identifiers for matching records across environments.

---

## 3. Seed Target Quantitative Goals (Gradual Roadmap)

- **Careers**: 8–10 target career roles (e.g. Full Stack Developer, Frontend Developer, Backend Developer, AI/ML Engineer, DevOps Engineer, Mobile Developer).
- **Skills**: 30–50 core technical and soft skills.
- **Questions**: 100+ diagnostic and skill-specific assessment questions across difficulty levels.
- **Resources**: 20+ curated articles, videos, and documentation links.
- **Projects**: 15+ practical real-world project assignments.

---

## 4. End-to-End Demo Scenario Walkthrough

To demonstrate Person 2's intelligence engine during hackathon judging, the seed system will pre-populate a deterministic **Demo Student Persona**:

### Step-by-Step Demo Flow:
1. **Target Career**: Full Stack Web Developer.
2. **Initial Diagnostic Assessment**: Demo student completes initial test.
3. **Evaluated Skill Scores**:
   - `React`: 80 / 100
   - `JavaScript`: 85 / 100
   - `Node.js`: 38 / 100
   - `REST API`: 30 / 100
   - `MongoDB`: 20 / 100
4. **Calculated Skill Gaps**:
   - `Node.js`: Gap = 37 (Target 75 - Current 38)
   - `REST API`: Gap = 45 (Target 75 - Current 30)
   - `MongoDB`: Gap = 55 (Target 75 - Current 20)
5. **Roadmap Generation**: Output sequential roadmap targeting REST API → Node.js → MongoDB.
6. **Progress & Reassessment Trigger**: Simulating completion of REST API module and taking a reassessment test.
7. **Adaptive Roadmap Execution**: Updated score `REST API: 85 / 100` → Gap drops to 0 → Roadmap dynamically recalculates to highlight Node.js & MongoDB!
