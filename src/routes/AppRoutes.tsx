import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/layouts/PublicLayout'
import { StudentLayout } from '@/layouts/StudentLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
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
import { CareerReadinessPage } from '@/pages/career/CareerReadinessPage'
import { MentorPage } from '@/pages/mentor/MentorPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

// Route-Level Code Splitting for Admin Portal
const AdminDashboardPage = React.lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
)
const StudentsPage = React.lazy(() =>
  import('@/pages/admin/students/StudentsPage').then((m) => ({ default: m.StudentsPage }))
)
const StudentDetailPage = React.lazy(() =>
  import('@/pages/admin/students/StudentDetailPage').then((m) => ({ default: m.StudentDetailPage }))
)
const AdminAssessmentsPage = React.lazy(() =>
  import('@/pages/admin/assessments/AssessmentsPage').then((m) => ({ default: m.AssessmentsPage }))
)
const AdminSkillsPage = React.lazy(() =>
  import('@/pages/admin/skills/SkillsPage').then((m) => ({ default: m.SkillsPage }))
)
const AdminResourcesPage = React.lazy(() =>
  import('@/pages/admin/resources/ResourcesPage').then((m) => ({ default: m.ResourcesPage }))
)
const LearningPathsPage = React.lazy(() =>
  import('@/pages/admin/learning-paths/LearningPathsPage').then((m) => ({ default: m.LearningPathsPage }))
)
const AdminCareersPage = React.lazy(() =>
  import('@/pages/admin/careers/CareersPage').then((m) => ({ default: m.CareersPage }))
)
const AnalyticsPage = React.lazy(() =>
  import('@/pages/admin/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
)
const AdminSettingsPage = React.lazy(() =>
  import('@/pages/admin/settings/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
)

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
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      {/* Authenticated Student Portal with StudentLayout (Sidebar & Header) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
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
        <Route path={ROUTES.CAREER_READINESS} element={<CareerReadinessPage />} />
        <Route path={ROUTES.MENTOR} element={<MentorPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>

      {/* Authenticated Admin Portal with AdminLayout & Route-Level Suspense */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminDashboardPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_STUDENTS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <StudentsPage />
            </React.Suspense>
          }
        />
        <Route
          path="/admin/students/new"
          element={<Navigate to={`${ROUTES.ADMIN_STUDENTS}?action=new`} replace />}
        />
        <Route
          path={ROUTES.ADMIN_STUDENT_DETAIL}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <StudentDetailPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_ASSESSMENTS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminAssessmentsPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_SKILLS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminSkillsPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_RESOURCES}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminResourcesPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_LEARNING_PATHS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <LearningPathsPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_CAREERS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminCareersPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_ANALYTICS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AnalyticsPage />
            </React.Suspense>
          }
        />
        <Route
          path={ROUTES.ADMIN_SETTINGS}
          element={
            <React.Suspense fallback={<DashboardSkeleton />}>
              <AdminSettingsPage />
            </React.Suspense>
          }
        />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}
