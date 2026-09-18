# P2_INTEGRATION_CONTRACT — Person 1 / Person 2 Integration Boundaries

## 1. Overview

This document specifies the exact API integration points, data exchange contracts, and ownership handoffs between **Person 1** (Auth, User, StudentProfile, Common API) and **Person 2** (Database, Intelligence, Skill/Career/Roadmap Engines).

---

## 2. Integration Data Flow

```
[Person 1: Onboarding / Auth] ──► Passes studentProfileId & careerId
                                         │
                                         ▼
                               [Person 2: Assessment Engine]
                                         │
                                         ▼
                               [Person 2: Scoring & Gap Engine]
                                         │
                                         ▼
[Person 1: Dashboard API] ◄──── Returns SkillScores, Gaps, Priorities, & Roadmap
```

---

## 3. Person 1 → Person 2 Inputs (Dependencies)

| Input Entity | Source | Passed As | Purpose |
| ------------ | ------ | --------- | ------- |
| `authenticatedUser` | Person 1 JWT Auth Middleware | `req.user.userId` | Identifies authenticated user session |
| `studentProfileId` | Person 1 StudentProfile Model | `req.user.studentProfileId` | Links assessment attempt, scores, and roadmaps to student |
| `targetCareerId` | Person 1 Onboarding API | `studentProfile.targetCareerId` | Determines target skill requirements from `CareerSkill` |
| `assessmentResponses` | Person 1 Assessment UI | HTTP POST payload | Raw question answers submitted by student for evaluation |

---

## 4. Person 2 → Person 1 Outputs (Services Provided)

| Service Output | Consumer | Interface / Service Method | Purpose |
| -------------- | -------- | -------------------------- | ------- |
| `skillScores` | Person 1 Dashboard & Profile API | `AssessmentScoringService.getLatestScores(studentProfileId)` | Provides breakdown of student's current skill levels |
| `skillGaps` | Person 1 Dashboard API | `SkillGapService.calculateGaps(studentProfileId)` | Provides active gaps for target career |
| `priorities` | Person 1 Dashboard API | `PriorityEngine.getRankedPriorities(studentProfileId)` | Provides top priority skills to focus on |
| `activeRoadmap` | Person 1 Roadmap UI | `RoadmapService.getCurrentRoadmap(studentProfileId)` | Delivers ordered learning modules & recommendations |

---

## 5. API Response JSON Envelope Standard

All Person 2 APIs must adhere to Person 1's standard response envelope:

### Success Response Envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response Envelope:
```json
{
  "success": false,
  "error": {
    "code": "SKILL_NOT_FOUND",
    "message": "The requested skill ID does not exist.",
    "details": null
  }
}
```

---

## 6. Target Endpoint Boundaries (`TO BE AGREED`)

- `POST /api/v1/assessments/submit` (`TO BE AGREED` - Person 1 controller calling Person 2 service)
- `GET /api/v1/roadmaps/current` (`TO BE AGREED`)
- `GET /api/v1/skills/gaps` (`TO BE AGREED`)
