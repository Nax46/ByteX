# P2_CAREER_INTELLIGENCE_SPEC — Career & CareerSkill Specification

## 1. Overview

The `Career` and `CareerSkill` domain models define industry roles (e.g. Full Stack Developer, AI Engineer) and map their specific skill requirements, target proficiency levels, and importance weights.

---

## 2. Structure & Mapping Architecture

```
[Career Entity]
     │
     └── (1-to-N) ──► [CareerSkill Entity] ── (N-to-1) ──► [Skill Entity]
                            │
                            ├── requiredLevel (0-100)
                            ├── importance (CRITICAL | HIGH | MEDIUM | LOW)
                            ├── weight (0.0 - 1.0)
                            └── prerequisites (Array of Skill ObjectIds)
```

---

## 3. Career Entity Spec

- **`title`**: Role display name (e.g. "Full Stack Web Developer").
- **`slug`**: URL slug (e.g. `full-stack-web-developer`).
- **`description`**: Overview of career responsibilities.
- **`category`**: Domain grouping (e.g. "Web Development", "Data & AI").

---

## 4. CareerSkill Entity Spec

The `CareerSkill` junction document defines how much of a given skill a career requires:

| Field | Type | Description |
| ----- | ---- | ----------- |
| `careerId` | ObjectId | Reference to `Career` |
| `skillId` | ObjectId | Reference to `Skill` |
| `requiredLevel` | Number (0-100) | Benchmark level needed for career readiness (e.g. 75 for Node.js) |
| `importance` | Enum | `CRITICAL` (Core necessity), `HIGH` (Important), `MEDIUM` (Secondary), `LOW` (Nice to have) |
| `weight` | Number | Weight factor used in readiness score aggregation |
| `prerequisites` | Array of ObjectId | Other `Skill` IDs that must be learned before this skill |

---

## 5. Prerequisite & Dependency Rules

- A skill requirement in a career can depend on other skills (e.g., `Express` requires `JavaScript` and `Node.js`).
- **Cycle Prevention**: The dependency graph defined by `prerequisites` must be a **Directed Acyclic Graph (DAG)**. Circular dependencies are invalid.

---

## 6. Items Marked `TO BE AGREED`

1. **Career Readiness Weight Formula**: Exact mathematical formula combining weighted skill gaps into an overall career readiness index `TO BE AGREED`.
2. **Prerequisite Enforcement Strictness**: Whether missing a prerequisite hard-blocks a roadmap step or simply increases priority weight `TO BE AGREED`.
