# P2_INTELLIGENCE_RULEBOOK — Core Intelligence Rules & Governance

## 1. Governance Principles

1. **Deterministic Authority**: All numerical metrics—scoring, skill levels, gaps, priority ranks, and roadmap milestone order—MUST be computed deterministically by pure algorithmic functions.
2. **AI Boundary**: AI services (Google Gemini) MUST NOT generate numerical scores or compute gaps directly. AI is confined to generating natural language explanations, personalizing milestone descriptions, and curating recommended learning resources/projects.
3. **Pipeline Integrity**: The intelligence pipeline must execute in strict order without skipping stages.

---

## 2. Intelligence Pipeline Flow

```
1. Assessment Submission
       │
       ▼
2. Deterministic Assessment Scoring
       │
       ▼
3. Skill Score Generation (Per-skill breakdown)
       │
       ▼
4. Skill Gap Calculation (targetLevel - currentLevel)
       │
       ▼
5. Priority Ranking Engine (Gap + Importance + Dependencies)
       │
       ▼
6. Roadmap Generation Engine (Ordered Modules)
       │
       ▼
7. Progress Tracking & Reassessment Trigger
       │
       ▼
8. Adaptive Roadmap Update
```

---

## 3. Layer Specifications

### 3.1 Deterministic Assessment Scoring
- **Input**: `AssessmentAttempt` submission with selected answer options.
- **Rule**: Compare `selectedOptionId` against `correctOptionId` in `Question` collection.
- **Invariants**:
  - Score per question is binary or point-weighted based on difficulty.
  - Question scoring logic must be 100% deterministic (unit-tested with zero randomness).

### 3.2 Skill Score Generation
- **Input**: Graded answers grouped by `skillId`.
- **Formula**:
  $$\text{skillScore} = \left( \frac{\text{sum of earned points}}{\text{sum of total possible points}} \right) \times 100$$
- **Rule**: Scores MUST be calculated and stored **per skill**. They MUST NOT be combined into a single overall student percentage.

### 3.3 Skill Gap Calculation
- **Input**: `currentLevel` (from student's latest `SkillScore`) & `targetLevel` (from `CareerSkill` requirement).
- **Basic Formula**:
  $$\text{gap} = \text{targetLevel} - \text{currentLevel}$$
- **Clamping Rule**: If $\text{currentLevel} \ge \text{targetLevel}$, then $\text{gap} = 0$. Gap can never be negative.

### 3.4 Priority Engine
- **Input**: Skill Gaps, CareerSkill `importance`, and prerequisite relationships.
- **Goal**: Rank skills to determine which modules the student should learn first.
- **Factors**:
  1. Gap magnitude ($\text{targetLevel} - \text{currentLevel}$)
  2. Career importance weight (`CRITICAL` > `HIGH` > `MEDIUM` > `LOW`)
  3. Prerequisite resolution (Skills required by other skills must be prioritized first)

### 3.5 Roadmap & Ordering Engine
- **Input**: Ranked skills with prerequisites.
- **Rule**: Perform a topological sort on prerequisite skill dependencies before placing modules into sequential roadmap order.

### 3.6 Reassessment & Adaptive Roadmap
- **Trigger**: Student finishes a major module or requests a reassessment.
- **Adaptive Execution**:
  1. Student completes new `AssessmentAttempt`.
  2. Recalculate updated `SkillScores`.
  3. Recalculate updated `SkillGap`.
  4. Create a new version of the `Roadmap` marked `isCurrent = true`, setting previous version `isCurrent = false`.
  5. Preserve full historical attempt and roadmap data.
