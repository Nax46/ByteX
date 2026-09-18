# P2_DATABASE_INDEX_POLICY — Database Performance & Indexing Policy

## 1. Overview

This document specifies the MongoDB database indexing rules for Person 2 collections. Indexing must be query-pattern-driven to ensure high performance without unnecessary write overhead.

---

## 2. General Indexing Rules

1. **Query-Driven**: Do NOT create speculative indexes. Every index must be justified by an explicit backend query pattern.
2. **Compound Index Ordering**: Order fields in compound indexes by `[Equality] -> [Sort] -> [Range]`.
3. **Selective Projections**: Backend queries should project only required fields (`select('name slug')`) rather than returning full documents unnecessarily.

---

## 3. Detailed Collection Index Catalog

### 3.1 `skills` Collection
- **Query Pattern**: Fetching skill by slug (e.g. `findOne({ slug })`).
  - Index: `{ slug: 1 }` (Unique)
- **Query Pattern**: Filtering skills by category.
  - Index: `{ category: 1 }`

### 3.2 `careers` Collection
- **Query Pattern**: Fetching career by slug.
  - Index: `{ slug: 1 }` (Unique)

### 3.3 `career_skills` Collection
- **Query Pattern**: Fetching all skill requirements for a career.
  - Index: `{ careerId: 1 }`
- **Query Pattern**: Checking existing career-skill mapping.
  - Index: `{ careerId: 1, skillId: 1 }` (Unique)

### 3.4 `questions` Collection
- **Query Pattern**: Fetching questions for a skill by difficulty.
  - Index: `{ skillId: 1, difficulty: 1 }`

### 3.5 `assessment_attempts` Collection
- **Query Pattern**: Fetching attempt history for a student sorted by date.
  - Index: `{ studentProfileId: 1, completedAt: -1 }`

### 3.6 `roadmaps` Collection
- **Query Pattern**: Fetching student's currently active roadmap.
  - Index: `{ studentProfileId: 1, isCurrent: 1 }`

### 3.7 `progress` Collection
- **Query Pattern**: Fetching progress record for a student's active roadmap.
  - Index: `{ studentProfileId: 1, roadmapId: 1 }` (Unique)

### 3.8 `resources` & `projects` Collections
- **Query Pattern**: Fetching resources or projects for a specific skill.
  - Index: `{ skillId: 1 }`
