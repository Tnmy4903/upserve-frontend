import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Home, LogIn, LogOut, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../features/notifications/services/notificationApi';
import type { Notification } from '../features/notifications/types';
import { notificationTarget } from '../features/notifications/components/NotificationList';
import { BrandLogo } from './BrandLogo';

export function GlobalHeader() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const authenticatedView = location.pathname.startsWith('/app') || location.pathname === '/change-password' || location.pathname === '/forbidden';
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const refreshUnread = () => notificationApi.unread().then(items => setUnreadCount(items.length)).catch(() => setUnreadCount(0));
    void refreshUnread();
    const timer = window.setInterval(refreshUnread, 30000);
    return () => window.clearInterval(timer);
  }, [user]);

  useEffect(() => {
    const refreshFromMutation = () => notificationApi.unread().then(items => setUnreadCount(items.length)).catch(() => undefined);
    window.addEventListener('upserve:notifications-changed', refreshFromMutation);
    return () => window.removeEventListener('upserve:notifications-changed', refreshFromMutation);
  }, []);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, []);

  useEffect(() => { setOpen(false); setNotificationOpen(false); }, [location.pathname]);

  useEffect(() => {
    const closeMenus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener('keydown', closeMenus);
    return () => document.removeEventListener('keydown', closeMenus);
  }, []);

  async function toggleNotifications() {
    if (!notificationOpen) setRecentNotifications((await notificationApi.list().catch(() => [] as Notification[])).slice(0, 4));
    setNotificationOpen(value => !value);
  }

  const accountControls = user ? (
    <div className="header-account-group">{location.pathname !== '/' && <><Link className="header-home-link" to="/" aria-label="Visit website"><Home size={18} aria-hidden="true" /><span>Home</span></Link><span className="header-divider" aria-hidden="true" /></>}<div className="notification-preview"><button className="notification-bell" type="button" onClick={() => void toggleNotifications()} aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'} aria-expanded={notificationOpen} aria-haspopup="dialog"><Bell size={20} aria-hidden="true" />{unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}</button>{notificationOpen && <div className="notification-popover" role="dialog" aria-label="Recent notifications"><strong>Recent notifications</strong>{recentNotifications.length ? recentNotifications.map(item => <Link key={item.id} to={notificationTarget(item) || '/app/notifications'} onClick={() => setNotificationOpen(false)}><span>{item.title}</span><small>{item.message}</small></Link>) : <p className="muted">You’re all caught up.</p>}<Link className="notification-view-all" to="/app/notifications" onClick={() => setNotificationOpen(false)}>View all notifications</Link></div>}</div><div className="public-account">
      <button className="public-account-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="menu" aria-controls="account-menu">
        <span className="account-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><span>{user.name}</span><ChevronDown className="public-account-chevron" size={16} aria-hidden="true" />
      </button>
      {open && <div id="account-menu" className="account-dropdown public-account-dropdown" role="menu"><div className="account-summary"><strong>{user.name}</strong><small>{user.email}</small><span className="role">{user.role.replace('_', ' ')}</span></div><Link role="menuitem" to="/app/profile" onClick={() => setOpen(false)}><UserRound size={16} aria-hidden="true" /> Profile</Link><Link role="menuitem" to="/change-password" onClick={() => setOpen(false)}><Settings size={16} aria-hidden="true" /> Change Password</Link><button type="button" role="menuitem" className="dropdown-logout" onClick={() => { setOpen(false); logout(); }}><LogOut size={16} aria-hidden="true" /> Log out</button></div>}
    </div></div>
  ) : <Link className="public-login" to="/login">Login <LogIn size={16} aria-hidden="true" /></Link>;

  return (
    <header ref={headerRef} className={`public-header ${authenticatedView ? 'public-header--app' : ''}`}>
      <Link className="brand" to="/">
        <BrandLogo />
      </Link>
      {!authenticatedView && <nav className="public-nav" aria-label="Primary navigation">
        <NavLink to="/">Home</NavLink><NavLink to="/services">Services</NavLink><NavLink to="/portfolio">Work</NavLink><NavLink to="/showcase">Platform</NavLink><NavLink to="/about">About</NavLink><NavLink to="/blogs">Insights</NavLink><NavLink to="/contact">Contact</NavLink>{user && <NavLink to="/app">Dashboard</NavLink>}
      </nav>}
      {!loading && accountControls}
    </header>
  );
}
