# P2_SKILL_CATALOG_SPEC — Skill Domain Specification

## 1. Overview

The `Skill` domain defines the atomic building blocks of the AI SkillPath intelligence engine. Every assessment question, career requirement, score, gap, and roadmap module is directly anchored to a `Skill`.

---

## 2. Naming Conventions & Identity

- **Skill Identity**: Uniquely identified by `_id` (ObjectId) and `slug` (URL-safe string).
- **Naming Rule**: Standard industry casing for display names (`React`, `Node.js`, `REST API`, `Git`, `Problem Solving`).
- **Slug Format**: Lowercase hyphenated string (`react`, `node-js`, `rest-api`, `git`, `problem-solving`).

---

## 3. Skill Categories

Skills are categorized using an enum:
- `TECHNICAL`: Pure programming languages, algorithms, data structures (e.g. `JavaScript`, `Python`).
- `FRAMEWORK`: Libraries & frameworks (e.g. `React`, `Express`, `Next.js`).
- `TOOL`: Development tools & databases (e.g. `MongoDB`, `Git`, `Docker`).
- `CORE_CS`: Computer science fundamentals (e.g. `REST API`, `System Design`, `Data Structures`).
- `SOFT`: Professional & cognitive skills (e.g. `Problem Solving`, `Communication`).

---

## 4. Initial Core Skill Catalog (Seed Baseline)

The initial seed catalog will contain at minimum:
1. `JavaScript` (technical, slug: `javascript`)
2. `React` (framework, slug: `react`)
3. `Node.js` (technical, slug: `node-js`)
4. `Express` (framework, slug: `express`)
5. `MongoDB` (tool, slug: `mongodb`)
6. `REST API` (core_cs, slug: `rest-api`)
7. `Git` (tool, slug: `git`)
8. `Authentication` (core_cs, slug: `authentication`)
9. `Problem Solving` (soft, slug: `problem-solving`)

*Note: Future skill additions are unconstrained and can be dynamically added via admin or seed tools.*

---

## 5. Validation & Constraints

- `name`: Required, non-empty, max 100 characters.
- `slug`: Required, unique, lowercase matching `/^[a-z0-9-]+$/`.
- `category`: Required, valid enum value.
- `maxLevel`: Required integer, default `100`, range `1-100`.

---

## 6. Indexing & Relationships

- **Unique Index**: `{ slug: 1 }`
- **Category Index**: `{ category: 1 }`
- **Relationships**: Referenced by `CareerSkill.skillId`, `Question.skillId`, `Roadmap.modules.skillId`, `Resource.skillId`, `Project.skillId`.
