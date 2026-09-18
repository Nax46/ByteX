# P2_GIT_MERGE_SAFETY — Git Workflow & Conflict Prevention

## 1. Overview

This document defines Git branching policies, file boundary ownership rules, and commit practices designed to eliminate merge conflicts between Person 1 and Person 2.

---

## 2. File Ownership Boundaries

### Person 2 Primary File Locations
Person 2 developers and AI agents should limit changes to these paths:
```text
backend/src/modules/intelligence/   (Person 2 engines & services)
backend/src/models/                  (Person 2 database schemas)
backend/src/seed/                    (Person 2 seed scripts)
docs/person-2/                       (Person 2 documentation)
```

### Person 1 Primary File Locations
Do NOT modify Person 1 locations without explicit coordination:
```text
backend/src/modules/auth/
backend/src/modules/user/
backend/src/modules/student-profile/
backend/src/middleware/
```

### Shared / Coordination Files
Changes to these shared files MUST be coordinated with Person 1:
```text
package.json
tsconfig.json
app.ts
server.ts
database.ts
.env.example
```

---

## 3. Recommended Branch Strategy

- **Feature Branch Format**: `p2/<module>-<short-task-name>`
- **Examples**:
  - `p2/skill-model-schema`
  - `p2/career-skill-mapping`
  - `p2/assessment-scoring-engine`
  - `p2/skill-gap-priority-engine`
  - `p2/roadmap-generation-engine`
  - `p2/gemini-ai-service`
  - `p2/idempotent-seed-pipeline`

---

## 4. Git Rules for AI Agents & Developers

1. **Focused Commits**: Make small, logical commits containing only related files for the active task.
2. **No Mass Formatting**: Avoid running auto-formatters (e.g. Prettier) on Person 1's codebase files, as it creates huge git diffs and causes merge conflicts.
3. **No Unnecessary File Renaming**: Do NOT rename existing Person 1 files or restructure shared directories.
4. **Secrets Prevention**: Never commit `.env` files or API keys. Verify `git status` before committing.
