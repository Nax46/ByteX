# P2_DATABASE_BLUEPRINT — Domain Database Architecture

## 1. Overview

This document specifies the MongoDB database architecture, domain models, relationships, embedding vs. referencing decisions, and validation rules owned by Person 2.

---

## 2. Domain Entities & Ownership

### Person 1 Owned Entities (External Dependencies for Person 2)
- **`User`**: Account identity & authentication credentials.
- **`StudentProfile`**: Student background, onboarding state, and target career reference.

### Person 2 Owned Domain Entities
1. **`Skill`**: Canonical catalog of technical & soft skills.
2. **`Career`**: Target career roles (e.g. Frontend Developer, AI Engineer).
3. **`CareerSkill`**: Requirement mapping connecting a Career to required Skills with target levels and importance.
4. **`Assessment`**: Test definition targeting specific skills or career tracks.
5. **`Question`**: Multiple-choice assessment questions mapped to a specific Skill and difficulty level.
6. **`AssessmentAttempt`**: Historical record of a student taking an assessment, evaluated answers, and generated skill scores.
7. **`Roadmap`**: Personalized, ordered learning plan with modules, milestones, and recommended resources/projects.
8. **`Progress`**: Tracking student completion state for roadmap modules and milestones.
9. **`Resource`**: Curated learning materials (articles, videos, courses) mapped to skills.
10. **`Project`**: Practical real-world project assignments mapped to skills and career roles.

---

## 3. Entity Blueprint Details

### 3.1 `Skill` Model
- **Purpose**: Canonical reference for all evaluable skills.
- **Key Fields**:
  - `_id`: ObjectId
  - `name`: String (Unique, e.g. "React")
  - `slug`: String (Unique index, e.g. "react")
  - `category`: Enum (`TECHNICAL`, `SOFT`, `TOOL`, `FRAMEWORK`, `CORE_CS`)
  - `description`: String
  - `maxLevel`: Number (Default: 100)
  - `timestamps`: `createdAt`, `updatedAt`

### 3.2 `Career` Model
- **Purpose**: Target career profiles for students.
- **Key Fields**:
  - `_id`: ObjectId
  - `title`: String (Unique, e.g. "Full Stack Web Developer")
  - `slug`: String (Unique index, e.g. "full-stack-web-developer")
  - `description`: String
  - `category`: String
  - `isActive`: Boolean
  - `timestamps`: `createdAt`, `updatedAt`

### 3.3 `CareerSkill` Model (Junction)
- **Purpose**: Defines skill requirements for a career.
- **Key Fields**:
  - `_id`: ObjectId
  - `careerId`: ObjectId (Ref: `Career`, Index)
  - `skillId`: ObjectId (Ref: `Skill`, Index)
  - `requiredLevel`: Number (0-100, e.g. 75)
  - `importance`: Enum (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - `weight`: Number (0.0 to 1.0)
  - `prerequisites`: Array of ObjectId (Ref: `Skill`)
  - `timestamps`: `createdAt`, `updatedAt`
- **Compound Index**: `{ careerId: 1, skillId: 1 }` (Unique)

### 3.4 `Assessment` Model
- **Purpose**: Container for evaluation tests.
- **Key Fields**:
  - `_id`: ObjectId
  - `title`: String
  - `type`: Enum (`DIAGNOSTIC`, `SKILL_SPECIFIC`, `REASSESSMENT`)
  - `targetSkillIds`: Array of ObjectId (Ref: `Skill`)
  - `durationMinutes`: Number
  - `isActive`: Boolean

### 3.5 `Question` Model
- **Purpose**: Individual assessment items.
- **Key Fields**:
  - `_id`: ObjectId
  - `skillId`: ObjectId (Ref: `Skill`, Index)
  - `text`: String
  - `options`: Array of `{ optionId: String, text: String }`
  - `correctOptionId`: String (Hidden from client responses)
  - `difficulty`: Enum (`EASY`, `MEDIUM`, `HARD`)
  - `points`: Number (Default: 10)
  - `explanation`: String

### 3.6 `AssessmentAttempt` Model
- **Purpose**: Immutable historical log of student test submissions.
- **Key Fields**:
  - `_id`: ObjectId
  - `studentProfileId`: ObjectId (Ref: `StudentProfile`, Index)
# P2_DATABASE_BLUEPRINT — Domain Database Architecture

## 1. Overview

This document specifies the MongoDB database architecture, domain models, relationships, embedding vs. referencing decisions, and validation rules owned by Person 2.

---

## 2. Domain Entities & Ownership

### Person 1 Owned Entities (External Dependencies for Person 2)
- **`User`**: Account identity & authentication credentials.
- **`StudentProfile`**: Student background, onboarding state, and target career reference.

### Person 2 Owned Domain Entities
1. **`Skill`**: Canonical catalog of technical & soft skills.
2. **`Career`**: Target career roles (e.g. Frontend Developer, AI Engineer).
3. **`CareerSkill`**: Requirement mapping connecting a Career to required Skills with target levels and importance.
4. **`Assessment`**: Test definition targeting specific skills or career tracks.
5. **`Question`**: Multiple-choice assessment questions mapped to a specific Skill and difficulty level.
6. **`AssessmentAttempt`**: Historical record of a student taking an assessment, evaluated answers, and generated skill scores.
7. **`Roadmap`**: Personalized, ordered learning plan with modules, milestones, and recommended resources/projects.
8. **`Progress`**: Tracking student completion state for roadmap modules and milestones.
9. **`Resource`**: Curated learning materials (articles, videos, courses) mapped to skills.
10. **`Project`**: Practical real-world project assignments mapped to skills and career roles.

---

## 3. Entity Blueprint Details

### 3.1 `Skill` Model
- **Purpose**: Canonical reference for all evaluable skills.
- **Key Fields**:
  - `_id`: ObjectId
  - `name`: String (Unique, e.g. "React")
  - `slug`: String (Unique index, e.g. "react")
  - `category`: Enum (`TECHNICAL`, `SOFT`, `TOOL`, `FRAMEWORK`, `CORE_CS`)
  - `description`: String
  - `maxLevel`: Number (Default: 100)
  - `timestamps`: `createdAt`, `updatedAt`

### 3.2 `Career` Model
- **Purpose**: Target career profiles for students.
- **Key Fields**:
  - `_id`: ObjectId
  - `title`: String (Unique, e.g. "Full Stack Web Developer")
  - `slug`: String (Unique index, e.g. "full-stack-web-developer")
  - `description`: String
  - `category`: String
  - `isActive`: Boolean
  - `timestamps`: `createdAt`, `updatedAt`

### 3.3 `CareerSkill` Model (Junction)
- **Purpose**: Defines skill requirements for a career.
- **Key Fields**:
  - `_id`: ObjectId
  - `careerId`: ObjectId (Ref: `Career`, Index)
  - `skillId`: ObjectId (Ref: `Skill`, Index)
  - `requiredLevel`: Number (0-100, e.g. 75)
  - `importance`: Enum (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - `weight`: Number (0.0 to 1.0)
  - `prerequisites`: Array of ObjectId (Ref: `Skill`)
  - `timestamps`: `createdAt`, `updatedAt`
- **Compound Index**: `{ careerId: 1, skillId: 1 }` (Unique)

### 3.4 `Assessment` Model
- **Purpose**: Container for evaluation tests.
- **Key Fields**:
  - `_id`: ObjectId
  - `title`: String
  - `type`: Enum (`DIAGNOSTIC`, `SKILL_SPECIFIC`, `REASSESSMENT`)
  - `targetSkillIds`: Array of ObjectId (Ref: `Skill`)
  - `durationMinutes`: Number
  - `isActive`: Boolean

### 3.5 `Question` Model
- **Purpose**: Individual assessment items.
- **Key Fields**:
  - `_id`: ObjectId
  - `skillId`: ObjectId (Ref: `Skill`, Index)
  - `text`: String
  - `options`: Array of `{ optionId: String, text: String }`
  - `correctOptionId`: String (Hidden from client responses)
  - `difficulty`: Enum (`EASY`, `MEDIUM`, `HARD`)
  - `points`: Number (Default: 10)
  - `explanation`: String

### 3.6 `AssessmentAttempt` Model
- **Purpose**: Immutable historical log of student test submissions.
- **Key Fields**:
  - `_id`: ObjectId
  - `studentProfileId`: ObjectId (Ref: `StudentProfile`, Index)
  - `assessmentId`: ObjectId (Ref: `Assessment`)
  - `answers`: Array of `{ questionId: ObjectId, selectedOptionId: String, isCorrect: Boolean, timeTakenSeconds: Number }`
  - `skillScores`: Array of `{ skillId: ObjectId, score: Number, totalQuestions: Number, correctCount: Number }`
  - `completedAt`: Date
- **Historical Rule**: Immutable. Never overwrite an existing attempt record.

### 3.7 `Roadmap` Model
- **Purpose**: Generated learning path for a student.
- **Key Fields**:
  - `_id`: ObjectId
  - `studentProfileId`: ObjectId (Ref: `StudentProfile`, Index)
  - `careerId`: ObjectId (Ref: `Career`)
  - `version`: Number (Incremental for adaptive roadmaps: 1, 2, 3...)
  - `isCurrent`: Boolean (Index, exactly one true per studentProfileId)
  - `status`: Enum (`DRAFT`, `ACTIVE`, `COMPLETED`, `ARCHIVED`)
  - `generationReason`: Enum (`INITIAL`, `REASSESSMENT`, `ADAPTIVE`)
  - `generatedFromAssessmentAttemptId`: ObjectId (Ref: `AssessmentAttempt`, optional index for traceability & duplicate generation protection)
  - `modules`: Array of Embedded Module Objects (`IRoadmapModule[]`)
  - `timestamps`: `createdAt`, `updatedAt`
- **Indexes**:
  - `{ studentProfileId: 1, isCurrent: 1 }`
  - `{ studentProfileId: 1, generatedFromAssessmentAttemptId: 1 }`
- **Generation Service**: `generateRoadmapForStudent` in `backend/src/services/roadmapGenerationService.ts` & `generateAdaptiveRoadmapForStudent` in `backend/src/services/adaptiveRoadmapService.ts`


### 3.8 `RoadmapProgress` Model
- **Purpose**: State tracker for roadmap module progression and overall completion velocity.
- **Key Fields**:
  - `_id`: ObjectId
  - `roadmapId`: ObjectId (Ref: `Roadmap`, Unique Index)
  - `studentProfileId`: ObjectId (Ref: `StudentProfile`, Index)
  - `userId`: ObjectId (Ref: `User`, Index)
  - `modules`: Array of Embedded Module Progress Objects:
    - `moduleId`: String (Matches `IRoadmapModule.moduleId`)
    - `status`: Enum (`LOCKED`, `IN_PROGRESS`, `COMPLETED`)
    - `progressPercent`: Number (0 to 100)
    - `startedAt`: Date
    - `completedAt`: Date
    - `lastActivityAt`: Date
  - `overallProgress`: Number (0 to 100 integer)
  - `totalModules`: Number
  - `completedModules`: Number
  - `inProgressModules`: Number
  - `lockedModules`: Number
  - `lastActiveAt`: Date
- **Collection**: `roadmap_progress`
- **Isolation Rule**: 1-to-1 unique mapping per `roadmapId`. Version 1 and Version 2 roadmaps have separate progress documents.

---

## 4. Embedding vs. Referencing Strategy

- **Referencing (Normalised)**: `Skill`, `Career`, `Question`, `AssessmentAttempt`, `Roadmap`, `Resource`, `Project` exist as top-level collections. Allows reusability and clean indexing.
- **Embedding (Denormalised)**:
  - `AssessmentAttempt.answers` and `AssessmentAttempt.skillScores` are embedded to ensure assessment results remain immutable snapshots even if questions change later.
  - `Roadmap.modules` and `RoadmapProgress.modules` are embedded within documents to retrieve full learning plans and progress states in single indexed queries.

---

## 5. Decisions Marked `TO BE AGREED`

1. **Score Normalization Range**: Standard 0-100 scale vs 0.0-1.0 float `TO BE AGREED` with Person 1 UI requirements.
2. **Roadmap Module Max Count**: Maximum modules per generated roadmap `TO BE AGREED` (Currently includes all active gap skills without arbitrary truncation).
