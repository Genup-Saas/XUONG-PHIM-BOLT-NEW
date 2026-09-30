import {
  ArrowUpRight,
  ChevronDown,
  Clapperboard,
  FileText,
  Grid2X2,
  Headphones,
  LayoutDashboard,
  Layers3,
  MoreHorizontal,
  Settings2,
  Users,
  WandSparkles,
  Clock,
} from 'lucide-react';
import type { Settings } from '@/lib/types';
import { useI18n } from '@/lib/i18nContext';

export type NavKey =
  | 'Overview'
  | 'My projects'
  | 'Assets'
  | 'Templates'
  | 'Script writer'
  | 'Characters'
  | 'History'
  | 'Settings';

type SidebarProps = {
  activeNav: NavKey;
  onNavChange: (nav: NavKey) => void;
  onCreateClick: () => void;
  onUpgradeClick: () => void;
  settings: Settings | null;
  projectCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const navItems: { label: NavKey; icon: typeof LayoutDashboard; key: string }[] = [
  { label: 'Overview', icon: LayoutDashboard, key: 'nav.overview' },
  { label: 'My projects', icon: Clapperboard, key: 'nav.myProjects' },
  { label: 'Assets', icon: Layers3, key: 'nav.assets' },
  { label: 'Templates', icon: Grid2X2, key: 'nav.templates' },
  { label: 'Script writer', icon: FileText, key: 'nav.scriptWriter' },
  { label: 'Characters', icon: Users, key: 'nav.characters' },
  { label: 'History', icon: Clock, key: 'nav.history' },
];

function Logo() {
  return (
    <div className="brand-mark" aria-label="GenUp">
      <span className="brand-gen">GEN</span>
      <span className="brand-up">UP</span>
      <span className="brand-tail" aria-hidden="true">↗</span>
    </div>
  );
}

export function Sidebar({
  activeNav,
  onNavChange,
  onCreateClick,
  onUpgradeClick,
  settings,
  projectCount,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { t } = useI18n();
  const creditsUsed = settings?.credits_used ?? 680;
  const creditsTotal = settings?.credits_total ?? 1000;
  const pct = Math.round((creditsUsed / creditsTotal) * 100);

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} aria-hidden="true" />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-top"><Logo /></div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">{settings?.workspace_name?.charAt(0) ?? 'S'}</div>
          <div className="workspace-copy">
            <strong>{settings?.workspace_name ?? 'Studio North'}</strong>
            <span>{settings?.workspace_type ?? t('misc.personalWorkspace')}</span>
          </div>
          <ChevronDown size={15} className="muted-icon" />
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-caption">{t('nav.workspace')}</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.label;
            return (
              <button
                key={item.label}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => { onNavChange(item.label); onMobileClose(); }}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                <span>{t(item.key)}</span>
                {item.label === 'My projects' && <span className="nav-count">{String(projectCount).padStart(2, '0')}</span>}
              </button>
            );
          })}
          <p className="nav-caption nav-caption-spaced">{t('nav.create')}</p>
          <button className="nav-item" onClick={onCreateClick}>
            <WandSparkles size={18} /><span>{t('nav.aiStudio')}</span><span className="new-pill">NEW</span>
          </button>
          <button className="nav-item" onClick={() => { onNavChange('Assets'); onMobileClose(); }}>
            <Headphones size={18} /><span>{t('nav.soundLibrary')}</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="usage-card">
            <div className="usage-heading"><span>{t('misc.credits')}</span><span>{pct}%</span></div>
            <div className="usage-bar"><div style={{ width: `${pct}%` }} /></div>
            <p>{creditsUsed} / {creditsTotal} {t('misc.creditsUsed')}</p>
            <button onClick={onUpgradeClick}>{t('misc.upgrade')} <ArrowUpRight size={13} /></button>
          </div>
          <button
            className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`}
            onClick={() => { onNavChange('Settings'); onMobileClose(); }}
            aria-current={activeNav === 'Settings' ? 'page' : undefined}
          >
            <Settings2 size={18} /><span>{t('nav.settings')}</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">{settings?.user_initials ?? 'NL'}</div>
            <div>
              <strong>{settings?.user_name ?? 'Nguyen Lam'}</strong>
              <span>{settings?.user_role ?? t('misc.creatorAccount')}</span>
            </div>
            <MoreHorizontal size={17} className="muted-icon" />
          </div>
        </div>
      </aside>
    </>
  );
}
