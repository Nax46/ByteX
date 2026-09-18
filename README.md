# AI SkillPath — Frontend Platform

> **«Know your skills. Find your gaps. Build your future.»**  
> An AI-powered continuous learning roadmap and career readiness platform for modern developers.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with centralized theme tokens & glassmorphism utilities
- **Routing**: [React Router v7](https://reactrouter.com/) (BrowserRouter with public & protected route boundaries)
- **HTTP Client**: [Axios](https://axios-http.com/) with centralized interceptors, token caching, and error normalization
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your backend API base URL (the backend team can set this to their chosen port/host):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ENABLE_MOCK_FALLBACK=true
```
*(Note: Do not commit `.env` files containing secrets.)*

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build & Verify
```bash
npm run typecheck    # Strict TypeScript verification
npm run lint         # ESLint validation
npm run build        # Production bundle compilation
```

---

## 📁 Architecture & Folder Structure

```
src/
├── assets/                  # Static media, icons, and illustrations
├── components/
│   ├── ui/                  # Reusable UI primitives (Button, Input, Select, Card, Badge, Modal, etc.)
│   ├── common/              # Composite states (LoadingState, EmptyState, ErrorState)
│   ├── layout/              # Navbars, Sidebars, Header, MobileNav, Footer
│   └── charts/              # Visual gauges & chart abstractions
├── pages/
│   ├── public/              # LandingPage, FeaturesPage, HowItWorksPage
│   ├── auth/                # LoginPage, RegisterPage
│   ├── onboarding/          # OnboardingPage (6-step structured student wizard)
│   ├── dashboard/           # DashboardPage (Telemetry, Skill Gaps, Roadmap, Projects)
│   ├── assessment/          # AssessmentPage, AssessmentResultsPage
│   ├── skills/              # SkillsPage, SkillGapPage
│   ├── roadmap/             # RoadmapPage (Visual milestone timeline)
│   ├── resources/           # ResourcesPage
│   ├── projects/            # ProjectsPage
│   ├── career/              # CareerReadinessPage, ProgressPage
│   ├── mentor/              # MentorPage (Contextual AI chat interface)
│   ├── profile/             # ProfilePage
│   └── settings/            # SettingsPage (Integration toggle, preferences)
├── layouts/
│   ├── PublicLayout.tsx     # Public wrapper with sticky navbar & footer
│   └── StudentLayout.tsx    # Authenticated portal with collapsible sidebar & mobile drawer
├── routes/
│   ├── AppRoutes.tsx        # Centralized route tree with protected route gates
│   ├── ProtectedRoute.tsx   # Session validator & login redirector
│   └── routeConfig.ts       # Route metadata & title registries
├── api/
│   ├── client.ts            # Centralized Axios client (base URL, bearer token, error mapping)
│   └── endpoints/           # Modular endpoint files for backend team integration
│       ├── auth.api.ts
│       ├── profile.api.ts
│       ├── assessment.api.ts
│       ├── skills.api.ts
│       ├── roadmap.api.ts
│       ├── resources.api.ts
│       ├── projects.api.ts
│       └── mentor.api.ts
├── hooks/
│   └── useAuth.ts           # Re-exported authentication hook
├── context/
│   └── AuthContext.tsx      # User session, JWT persistence, login/register/logout, mock toggle
├── types/                   # Strict TypeScript domain interfaces
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── skill.types.ts
│   ├── assessment.types.ts
│   ├── roadmap.types.ts
│   ├── resource.types.ts
│   ├── project.types.ts
│   └── onboarding.types.ts
├── constants/
│   ├── routes.ts            # Type-safe route paths
│   ├── app.constants.ts     # Platform configuration & taxonomy
│   └── theme.constants.ts   # Design tokens & color palette
├── utils/
│   ├── cn.ts                # Class merging utility (clsx + tailwind-merge)
│   ├── formatters.ts        # String, date, and percentage helpers
│   ├── validation.ts        # Email and password validation
│   └── storage.ts           # Safe localStorage wrapper
├── services/
│   └── storage.service.ts   # Session token and user data persistence service
├── mocks/                   # Isolated mock data for parallel development
│   ├── dashboard.mock.ts
│   ├── skills.mock.ts
│   ├── assessment.mock.ts
│   └── user.mock.ts
├── App.tsx                  # Root application wrapper (Router + AuthProvider)
└── main.tsx                 # React DOM mount point
```

---

## 🔌 Backend Integration Contract

The backend and database team (MongoDB, Node.js / FastAPI) can integrate seamlessly by following this pattern:

```
UI Component
     ↓
Hook / Context
     ↓
API Endpoint Module (`src/api/endpoints/*.api.ts`)
     ↓
Axios Client (`src/api/client.ts`)
     ↓
Backend API Server
```

### Integration Points for Backend Developers

| Domain | File | Required Backend Endpoints |
|---|---|---|
| **Authentication** | `src/api/endpoints/auth.api.ts` | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me` |
| **Profile & Onboarding** | `src/api/endpoints/profile.api.ts` | `GET /profile`, `PUT /profile`, `GET /profile/stats`, `POST /onboarding` |
| **Skill Assessment** | `src/api/endpoints/assessment.api.ts` | `GET /assessments/questions`, `POST /assessments/submit`, `GET /assessments/results/latest` |
| **Skills & Gaps** | `src/api/endpoints/skills.api.ts` | `GET /skills`, `GET /skills/gaps`, `PUT /skills/:id/target` |
| **Learning Roadmap** | `src/api/endpoints/roadmap.api.ts` | `GET /roadmap`, `PUT /roadmap/milestones/:id/status`, `POST /roadmap/regenerate` |
| **Curated Resources** | `src/api/endpoints/resources.api.ts` | `GET /resources`, `PUT /resources/:id/completion` |
| **Hands-on Projects** | `src/api/endpoints/projects.api.ts` | `GET /projects/recommended`, `PUT /projects/:id/status` |
| **AI Mentor** | `src/api/endpoints/mentor.api.ts` | `POST /mentor/chat`, `GET /mentor/history` *(Secret keys stay on backend!)* |

### How to Connect:
1. Start your backend API server on your desired port.
2. In frontend `.env`, point `VITE_API_BASE_URL` to your API URL (e.g. `http://localhost:5000/api`).
3. Set `VITE_ENABLE_MOCK_FALLBACK=false` (or toggle the mode directly in the UI Header / Settings).
4. Update request/response contracts in the corresponding file in `src/api/endpoints/`.
5. **No UI component rewrites are needed.**

---

## 🧪 Mock Data Strategy

- All mock data is completely isolated inside `src/mocks/`.
- No large fake datasets are hardcoded in JSX views.
- The UI Header and Settings page feature a one-click **Dev Mock / Live Backend** toggle to easily evaluate UI behaviors independently.

---

## 🔒 Security Principles

- **Zero Secrets**: No API keys, JWT secrets, or MongoDB credentials exist in frontend code.
- **Backend AI Proxy**: LLM calls (e.g. Gemini API) are dispatched to backend endpoints where API keys remain secure in backend environment variables.
- **Session Protection**: Automatic token header injection and 401 unauthenticated session cleanup with graceful event handling.
