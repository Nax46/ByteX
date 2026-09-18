import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/layouts/PublicLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage'
import { FeaturesPage } from '@/pages/public/FeaturesPage'
import { HowItWorksPage } from '@/pages/public/HowItWorksPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

// Onboarding Page
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'

// Authenticated Student Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SkillsPage } from '@/pages/skills/SkillsPage'
import { SkillGapPage } from '@/pages/skills/SkillGapPage'
import { AssessmentPage } from '@/pages/assessment/AssessmentPage'
import { AssessmentResultsPage } from '@/pages/assessment/AssessmentResultsPage'
import { RoadmapPage } from '@/pages/roadmap/RoadmapPage'
import { ResourcesPage } from '@/pages/resources/ResourcesPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'
import { ProgressPage } from '@/pages/career/ProgressPage'
import { CareersPage } from '@/pages/career/CareersPage'
import { MentorPage } from '@/pages/mentor/MentorPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with PublicLayout (Navbar & Footer) */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.FEATURES} element={<FeaturesPage />} />
        <Route path={ROUTES.HOW_IT_WORKS} element={<HowItWorksPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Onboarding Flow (Protected, focused view) */}
      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Student Portal with StudentLayout (Sidebar & Header) */}
      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.SKILLS} element={<SkillsPage />} />
        <Route path={ROUTES.SKILL_GAP} element={<SkillGapPage />} />
        <Route path={ROUTES.ASSESSMENT} element={<AssessmentPage />} />
        <Route path={ROUTES.ASSESSMENT_RESULTS} element={<AssessmentResultsPage />} />
        <Route path={ROUTES.ROADMAP} element={<RoadmapPage />} />
        <Route path={ROUTES.RESOURCES} element={<ResourcesPage />} />
        <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
        <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />
        <Route path={ROUTES.CAREERS} element={<CareersPage />} />
        <Route path={ROUTES.CAREER_READINESS} element={<CareersPage />} />
        <Route path={ROUTES.MENTOR} element={<MentorPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
