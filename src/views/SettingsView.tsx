import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import type { Settings } from '@/lib/types';

type SettingsViewProps = {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSave: (updates: Partial<Settings>) => Promise<void>;
};

export function SettingsView({ settings, loading, error, onRetry, onSave }: SettingsViewProps) {
  const { t } = useI18n();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('');
  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [userRole, setUserRole] = useState('');
  const [creditsTotal, setCreditsTotal] = useState(1000);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setWorkspaceName(settings.workspace_name);
      setWorkspaceType(settings.workspace_type);
      setUserName(settings.user_name);
      setUserInitials(settings.user_initials);
      setUserRole(settings.user_role);
      setCreditsTotal(settings.credits_total);
    }
  }, [settings]);

  const nameErr = userName.trim().length > 0 && userName.trim().length < 2 ? `${t('settings.displayName')} min 2` : '';
  const initialsErr = userInitials.trim().length > 0 && userInitials.trim().length < 2 ? `${t('settings.initials')} min 2` : '';
  const canSave = userName.trim().length >= 2 && userInitials.trim().length >= 2 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSave({
        workspace_name: workspaceName.trim(),
        workspace_type: workspaceType.trim(),
        user_name: userName.trim(),
        user_initials: userInitials.trim().toUpperCase(),
        user_role: userRole.trim(),
        credits_total: creditsTotal,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save settings. Try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="content-wrap">
        <div className="settings-skeleton">
          <div className="skeleton-line w-40" />
          <div className="skeleton-line w-60" />
          <div className="skeleton-line w-60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrap">
        <div className="empty-state error-state">
          <div className="empty-icon error-icon">!</div>
          <strong>Something went wrong</strong>
          <span>{error}</span>
          <button className="primary-button empty-action" onClick={onRetry}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('settings.title')}</h2><p>{t('settings.desc')}</p></div>
        </div>
        <div className="settings-grid">
          <div className="settings-card">
            <h3 className="settings-card-title">{t('settings.workspace')}</h3>
            <div className="form-field">
              <label htmlFor="ws-name">{t('settings.workspaceName')}</label>
              <input id="ws-name" type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="ws-type">{t('settings.workspaceType')}</label>
              <input id="ws-type" type="text" value={workspaceType} onChange={(e) => setWorkspaceType(e.target.value)} />
            </div>
          </div>
          <div className="settings-card">
            <h3 className="settings-card-title">{t('settings.profile')}</h3>
            <div className="form-field">
              <label htmlFor="u-name">{t('settings.displayName')}</label>
              <input id="u-name" type="text" value={userName} onChange={(e) => setUserName(e.target.value)} aria-invalid={!!nameErr} />
              {nameErr && <span className="field-error">{nameErr}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="u-initials">{t('settings.initials')}</label>
              <input id="u-initials" type="text" maxLength={3} value={userInitials} onChange={(e) => setUserInitials(e.target.value)} aria-invalid={!!initialsErr} />
              {initialsErr && <span className="field-error">{initialsErr}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="u-role">{t('settings.role')}</label>
              <input id="u-role" type="text" value={userRole} onChange={(e) => setUserRole(e.target.value)} />
            </div>
          </div>
          <div className="settings-card">
            <h3 className="settings-card-title">{t('settings.credits')}</h3>
            <div className="form-field">
              <label htmlFor="credits-total">{t('settings.totalCredits')}</label>
              <input id="credits-total" type="number" min={100} max={100000} step={100} value={creditsTotal} onChange={(e) => setCreditsTotal(Number(e.target.value))} />
              <span className="field-hint">{settings?.credits_used ?? 0} {t('settings.used')} · {Math.max(0, creditsTotal - (settings?.credits_used ?? 0))} {t('settings.remaining')}</span>
            </div>
          </div>
        </div>
        {saveError && <div className="modal-error">{saveError}</div>}
        <div className="settings-footer">
          {saved && <span className="saved-indicator">{t('settings.saved')}</span>}
          <button className="primary-button" onClick={handleSave} disabled={!canSave} aria-busy={saving}>
            {saving ? <><span className="spinner" /> {t('settings.saving')}</> : <><Save size={17} /> {t('settings.save')}</>}
          </button>
        </div>
      </section>
    </div>
  );
}
