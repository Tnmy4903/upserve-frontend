import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, ChevronLeft, ChevronRight, ClipboardList, FileText, FolderKanban, LayoutDashboard, Settings, ShieldCheck, UserCog, UsersRound } from 'lucide-react';
import { GlobalHeader } from '../components/GlobalHeader';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const labels: Record<string, string> = { '/app': 'Dashboard', '/app/leads': 'Leads', '/app/requirements': 'Requirements', '/app/quotations': 'Quotations', '/app/projects': 'Projects', '/app/notifications': 'Notifications', '/app/profile': 'Profile', '/app/admin': 'Admin overview', '/app/users': 'Manage users', '/app/activity-logs': 'Activity logs', '/app/record-directory': 'Record directory', '/app/content': 'Content management' };
    const section = Object.keys(labels).find(path => location.pathname === path || (path !== '/app' && location.pathname.startsWith(`${path}/`)));
    document.title = `${section ? labels[section] : 'Workspace'} | Upserve`;
  }, [location.pathname]);
  const breadcrumbParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbLinks = breadcrumbParts.map((part, index, parts) => {
    const isIdentifier = part.length > 20 || /^[a-f0-9]{16,}$/i.test(part);
    if (isIdentifier) return { label: 'Details', path: `/${parts.slice(0, index).join('/')}`, current: index === parts.length - 1 };
    const labels: Record<string, string> = { app: 'Dashboard', leads: 'Leads', requirements: 'Requirements', quotations: 'Quotations', projects: 'Projects', notifications: 'Notifications', profile: 'Profile', admin: 'Admin overview', users: 'Manage users', content: 'Content management', 'activity-logs': 'Activity logs', 'record-directory': 'Record directory' };
    return { label: labels[part] || part.replace(/-/g, ' ').replace(/^./, value => value.toUpperCase()), path: `/${parts.slice(0, index + 1).join('/')}`, current: index === parts.length - 1 };
  }).filter((item, index) => index === 0 || item.label !== 'Details' || index === breadcrumbParts.length - 1);
  const isNestedDetail = location.pathname.split('/').filter(Boolean).length > 2;
  const admin = user?.role === 'super_admin';
  const staff = user?.role === 'super_admin' || user?.role === 'sub_admin';
  const mainLinks = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ...(staff ? [{ to: '/app/leads', label: 'Leads', icon: UsersRound }] : []),
    ...(user?.role === 'client' ? [{ to: '/app/requirements', label: 'Requirements', icon: FileText }] : []),
    ...(user?.role !== 'sub_admin' ? [{ to: '/app/quotations', label: 'Quotations', icon: FileText }] : []),
    { to: '/app/projects', label: 'Projects', icon: FolderKanban },
  ];
  const adminLinks = admin ? [{ to: '/app/admin', label: 'Admin overview', icon: ShieldCheck }, { to: '/app/users', label: 'Manage users', icon: UserCog }, { to: '/app/activity-logs', label: 'Activity logs', icon: ClipboardList }, { to: '/app/record-directory', label: 'Record directory', icon: BriefcaseBusiness }, { to: '/app/content', label: 'Content management', icon: Settings }] : [];
  const mobileLinks = mainLinks.filter(link => ['/app', '/app/leads', '/app/requirements', '/app/quotations', '/app/projects'].includes(link.to));

  return (
    <div className="authenticated-shell">
      <GlobalHeader />
      <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <aside aria-label="Workspace navigation">
          <nav id="app-navigation">
            {mainLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} title={collapsed ? label : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}
            {adminLinks.length > 0 && <div className="sidebar-section"><span>Administration</span>{adminLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} title={collapsed ? label : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span></NavLink>)}</div>}
          </nav>
          <button className="sidebar-collapse-toggle" type="button" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setCollapsed(value => !value)}>{collapsed ? <ChevronRight size={18} aria-hidden="true" /> : <><ChevronLeft size={18} aria-hidden="true" /><span className="sidebar-toggle-label">Collapse</span></>}</button>
        </aside>
        <main>
          {isNestedDetail && <nav className="app-breadcrumbs" aria-label="Breadcrumb">{breadcrumbLinks.map((item, index) => <span key={`${item.label}-${index}`} className={item.current ? 'current' : ''} aria-current={item.current ? 'page' : undefined}>{index > 0 && <span aria-hidden="true">/</span>}{item.current ? item.label : <Link to={item.path}>{item.label}</Link>}</span>)}</nav>}
          <Outlet />
        </main>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">{mobileLinks.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}</nav>
    </div>
  );
}
