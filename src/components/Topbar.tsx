import { Bell, Menu, MessageSquare } from 'lucide-react';
import type { NavKey } from './Sidebar';
import type { Settings } from '@/lib/types';
import { useI18n } from '@/lib/i18nContext';

type TopbarProps = {
  activeNav: NavKey;
  settings: Settings | null;
  notificationCount: number;
  onMobileMenu: () => void;
  onNotificationClick: () => void;
  onHelpClick: () => void;
};

export function Topbar({
  activeNav,
  settings,
  notificationCount,
  onMobileMenu,
  onNotificationClick,
  onHelpClick,
}: TopbarProps) {
  const { lang, setLang, t } = useI18n();
  const navLabels: Record<NavKey, string> = {
    'Overview': t('nav.overview'),
    'My projects': t('nav.myProjects'),
    'Assets': t('nav.assets'),
    'Templates': t('nav.templates'),
    'Script writer': t('nav.scriptWriter'),
    'Characters': t('nav.characters'),
    'History': t('nav.history'),
    'Settings': t('nav.settings'),
  };

  return (
    <header className="topbar">
      <button className="mobile-menu-button" onClick={onMobileMenu} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>
      <div className="breadcrumb">
        <span>{settings?.workspace_name ?? 'Studio North'}</span>
        <span className="crumb-separator">/</span>
        <strong>{navLabels[activeNav]}</strong>
      </div>
      <div className="top-actions">
        <div className="lang-toggle" role="group" aria-label="Language toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
          <button className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')} aria-pressed={lang === 'vi'}>VI</button>
        </div>
        <button className="icon-button" aria-label={`Notifications (${notificationCount} new)`} onClick={onNotificationClick}>
          <Bell size={18} />
          {notificationCount > 0 && <span className="notification-dot" />}
        </button>
        <div className="top-divider" />
        <button className="help-link" onClick={onHelpClick}>
          <MessageSquare size={16} /> {t('misc.helpCenter')}
        </button>
      </div>
    </header>
  );
}
