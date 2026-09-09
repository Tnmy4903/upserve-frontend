import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { AppLayout } from '../layouts/AppLayout';
import { GlobalHeader } from '../components/GlobalHeader';
import { PublicFooter } from '../components/PublicFooter';
import { ConfirmProvider } from '../components/ui';
import { AboutPage, BlogsPage, BlogDetailPage, PortfolioPage, PortfolioDetailPage, ContactPage, ServicesPage, ShowcasePage } from '../pages/PublicPages';

const LoginPage = lazy(() => import('../pages/LoginPage').then(({ LoginPage }) => ({ default: LoginPage })));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage').then(({ ChangePasswordPage }) => ({ default: ChangePasswordPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(({ DashboardPage }) => ({ default: DashboardPage })));
const AdminOverviewPage = lazy(() => import('../pages/AdminOverviewPage').then(({ AdminOverviewPage }) => ({ default: AdminOverviewPage })));
const ManageUsersPage = lazy(() => import('../pages/ManageUsersPage').then(({ ManageUsersPage }) => ({ default: ManageUsersPage })));
const ContentAdminPage = lazy(() => import('../pages/ContentAdminPage').then(({ ContentAdminPage }) => ({ default: ContentAdminPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(({ ProfilePage }) => ({ default: ProfilePage })));
const ForbiddenPage = lazy(() => import('../pages/BasicPages').then(({ ForbiddenPage }) => ({ default: ForbiddenPage })));
const NotFoundPage = lazy(() => import('../pages/BasicPages').then(({ NotFoundPage }) => ({ default: NotFoundPage })));
const HomePage = lazy(() => import('../pages/HomePage').then(({ HomePage }) => ({ default: HomePage })));
const LeadsPage = lazy(() => import('../features/leads/pages/LeadsPage').then(({ LeadsPage }) => ({ default: LeadsPage })));
const LeadDetailPage = lazy(() => import('../features/leads/pages/LeadDetailPage').then(({ LeadDetailPage }) => ({ default: LeadDetailPage })));
const RequirementsPage = lazy(() => import('../features/requirements/pages/RequirementsPage').then(({ RequirementsPage }) => ({ default: RequirementsPage })));
const RequirementDetailPage = lazy(() => import('../features/requirements/pages/RequirementDetailPage').then(({ RequirementDetailPage }) => ({ default: RequirementDetailPage })));
const QuotationsPage = lazy(() => import('../features/quotations/pages/QuotationsPage').then(({ QuotationsPage }) => ({ default: QuotationsPage })));
const QuotationCreatePage = lazy(() => import('../features/quotations/pages/QuotationCreatePage').then(({ QuotationCreatePage }) => ({ default: QuotationCreatePage })));
const QuotationDetailPage = lazy(() => import('../features/quotations/pages/QuotationDetailPage').then(({ QuotationDetailPage }) => ({ default: QuotationDetailPage })));
const ProjectsPage = lazy(() => import('../features/projects/pages/ProjectsPage').then(({ ProjectsPage }) => ({ default: ProjectsPage })));
const ProjectDetailPage = lazy(() => import('../features/projects/pages/ProjectDetailPage').then(({ ProjectDetailPage }) => ({ default: ProjectDetailPage })));
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage').then(({ NotificationsPage }) => ({ default: NotificationsPage })));
const ActivityLogsPage = lazy(() => import('../features/activityLogs/pages/ActivityLogsPage').then(({ ActivityLogsPage }) => ({ default: ActivityLogsPage })));
const RecordDirectoryPage = lazy(() => import('../features/admin/pages/RecordDirectoryPage').then(({ RecordDirectoryPage }) => ({ default: RecordDirectoryPage })));

function PublicLayout() { return <><GlobalHeader /><Outlet /><PublicFooter /></>; }

export function App() {
  return <ConfirmProvider><Suspense fallback={<div className="screen-state" role="status">Loading page…</div>}><Routes>
    <Route element={<PublicLayout />}><Route path="/" element={<HomePage />} /><Route path="/services" element={<ServicesPage />} /><Route path="/showcase" element={<ShowcasePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/blogs" element={<BlogsPage />} /><Route path="/blogs/:slug" element={<BlogDetailPage />} /><Route path="/portfolio" element={<PortfolioPage />} /><Route path="/portfolio/:slug" element={<PortfolioDetailPage />} /><Route path="/contact" element={<ContactPage />} /></Route>
    <Route path="/login" element={<LoginPage />} /><Route path="/change-password" element={<ChangePasswordPage />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}><Route path="/app" element={<DashboardPage />} /><Route path="/app/notifications" element={<NotificationsPage />} /><Route path="/app/projects" element={<ProjectsPage />} /><Route path="/app/projects/:projectId" element={<ProjectDetailPage />} />
      <Route element={<ProtectedRoute roles={['super_admin', 'sub_admin']} />}><Route path="/app/leads" element={<LeadsPage />} /><Route path="/app/leads/:leadId" element={<LeadDetailPage />} /></Route><Route element={<ProtectedRoute roles={['super_admin']} />}><Route path="/app/quotations/new" element={<QuotationCreatePage />} /></Route>
      <Route element={<ProtectedRoute roles={['super_admin']} />}><Route path="/app/users" element={<ManageUsersPage />} /></Route>
      <Route element={<ProtectedRoute roles={['super_admin']} />}><Route path="/app/admin" element={<AdminOverviewPage />} /></Route>
      <Route element={<ProtectedRoute roles={['super_admin', 'sub_admin', 'client']} />}><Route path="/app/requirements" element={<RequirementsPage />} /><Route path="/app/requirements/new" element={<RequirementsPage />} /></Route><Route element={<ProtectedRoute roles={['super_admin', 'sub_admin', 'client']} />}><Route path="/app/requirements/:requirementId" element={<RequirementDetailPage />} /></Route><Route element={<ProtectedRoute roles={['super_admin', 'client']} />}><Route path="/app/quotations" element={<QuotationsPage />} /><Route path="/app/quotations/:quotationId" element={<QuotationDetailPage />} /></Route>
      <Route element={<ProtectedRoute roles={['super_admin']} />}><Route path="/app/content" element={<ContentAdminPage />} /><Route path="/app/activity-logs" element={<ActivityLogsPage />} /><Route path="/app/record-directory" element={<RecordDirectoryPage />} /></Route><Route path="/app/profile" element={<ProfilePage />} /><Route path="/forbidden" element={<ForbiddenPage />} />
    </Route></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Suspense></ConfirmProvider>;
}
