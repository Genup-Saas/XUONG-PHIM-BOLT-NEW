import { useMemo } from 'react';
import { Clock, Film, Sparkles, WandSparkles, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { useHistory, useSettings } from '@/lib/hooks';
import { EmptyState, ErrorState } from '@/components/States';
import { timeAgo } from '@/lib/types';

const actionIcons: Record<string, typeof Film> = {
  create: WandSparkles,
  render: Film,
  edit: Sparkles,
  template: Sparkles,
};

export function HistoryView() {
  const { t } = useI18n();
  const historyState = useHistory();
  const settingsState = useSettings();

  const totalCredits = useMemo(() => historyState.data?.reduce((sum, h) => sum + h.credits_used, 0) ?? 0, [historyState.data]);

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('history.title')}</h2><p>{t('history.desc')}</p></div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-main">
            <div className="stat-icon red"><Zap size={19} /></div>
            <div><span className="stat-label">{t('usage.creditsUsed')}</span><strong>{String(totalCredits)}</strong><span className="stat-trend">{historyState.data?.length ?? 0} {t('history.action').toLowerCase()}s</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><Clock size={19} /></div>
            <div><span className="stat-label">{t('usage.creditsRemaining')}</span><strong>{String(Math.max(0, (settingsState.data?.credits_total ?? 1000) - (settingsState.data?.credits_used ?? 0)))}</strong><span className="stat-sub">{t('usage.creditsTotal')}: {settingsState.data?.credits_total ?? 1000}</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><Film size={19} /></div>
            <div><span className="stat-label">{t('usage.currentPlan')}</span><strong>{t('usage.planName')}</strong><span className="stat-sub">{t('usage.renewDate')} Oct 31, 2026</span></div>
          </div>
        </div>

        <div className="history-table-wrap">
          {historyState.loading && <div className="skeleton-line w-60" />}
          {historyState.error && <ErrorState message={historyState.error} onRetry={historyState.refetch} />}
          {!historyState.loading && !historyState.error && (historyState.data?.length ?? 0) === 0 && (
            <EmptyState icon={<Clock size={24} />} title={t('history.noHistory')} message={t('history.startCreating')} />
          )}
          {!historyState.loading && !historyState.error && (historyState.data?.length ?? 0) > 0 && (
            <table className="history-table">
              <thead><tr><th>{t('history.action')}</th><th>{t('history.entity')}</th><th>{t('history.credits')}</th><th>{t('history.detail')}</th><th>{t('history.date')}</th></tr></thead>
              <tbody>
                {historyState.data!.map((h) => {
                  const Icon = actionIcons[h.action_type] ?? Sparkles;
                  return (
                    <tr key={h.id}>
                      <td><span className="history-action-cell"><Icon size={14} /> {h.action_type}</span></td>
                      <td>{h.entity_name}</td>
                      <td><span className="history-credits">{h.credits_used}</span></td>
                      <td className="history-detail">{h.detail}</td>
                      <td>{timeAgo(h.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
