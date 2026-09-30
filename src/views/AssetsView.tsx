import { useMemo, useState } from 'react';
import { Download, Layers3, Plus, Search, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import type { Asset } from '@/lib/types';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/States';
import { timeAgo } from '@/lib/types';

type AssetsViewProps = {
  assets: Asset[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: () => void;
  onDelete: (a: Asset) => void;
};

export function AssetsView({ assets, loading, error, onRetry, onAdd, onDelete }: AssetsViewProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const types = useMemo(() => {
    const set = new Set(assets?.map((a) => a.type) ?? []);
    return ['All', ...Array.from(set)];
  }, [assets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (assets ?? []).filter((a) => {
      const mq = !q || a.name.toLowerCase().includes(q);
      const mt = typeFilter === 'All' || a.type === typeFilter;
      return mq && mt;
    });
  }, [assets, search, typeFilter]);

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('assets.title')}</h2><p>{assets?.length ?? 0} {t('assets.count')}</p></div>
          <button className="primary-button" onClick={onAdd}><Plus size={16} /> {t('assets.upload')}</button>
        </div>
        <div className="toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filter assets by type">
            {types.map((tp) => (
              <button key={tp} role="tab" aria-selected={typeFilter === tp} className={typeFilter === tp ? 'selected' : ''} onClick={() => setTypeFilter(tp)}>{tp === 'All' ? t('assets.allTypes') : tp}</button>
            ))}
          </div>
          <label className="search-box"><Search size={16} /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('assets.search')} aria-label={t('assets.search')} /></label>
        </div>
        <div className="project-grid">
          {loading && [0,1,2,3].map((i) => <SkeletonCard key={i} />)}
          {error && <ErrorState message={error} onRetry={onRetry} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState icon={<Layers3 size={24} />} title={search ? t('assets.noResults') : t('assets.noAssets')} message={search ? t('projects.tryAnother') : t('assets.uploadFirst')} action={{ label: t('assets.upload'), onClick: onAdd }} />
          )}
          {!loading && !error && filtered.map((asset) => (
            <article key={asset.id} className="project-card asset-card">
              <div className="project-image asset-image">
                <img src={asset.url} alt={asset.name} loading="lazy" />
                <div className="image-overlay" />
                <button className="asset-delete" onClick={() => onDelete(asset)} aria-label={`Delete ${asset.name}`}><Trash2 size={14} /></button>
              </div>
              <div className="project-info"><div className="project-info-text"><h3 title={asset.name}>{asset.name}</h3><p>{asset.type.toUpperCase()} · {asset.size}</p></div></div>
              <div className="project-meta">
                <span className="status-dot ready" /><span>{asset.type}</span><span className="meta-separator">•</span><span>{timeAgo(asset.created_at)}</span>
                <button className="asset-download" aria-label={`Download ${asset.name}`}><Download size={13} /></button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
