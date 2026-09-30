import { useMemo, useState } from 'react';
import { Grid2X2, Plus, Search, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import type { Template } from '@/lib/types';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/States';

type TemplatesViewProps = {
  templates: Template[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onUse: (t: Template) => void;
  onAdd: () => void;
};

export function TemplatesView({ templates, loading, error, onRetry, onUse, onAdd }: TemplatesViewProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const categories = useMemo(() => {
    const set = new Set(templates?.map((tp) => tp.category) ?? []);
    return ['All', ...Array.from(set)];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (templates ?? []).filter((tp) => {
      const mq = !q || `${tp.name} ${tp.description}`.toLowerCase().includes(q);
      const mc = catFilter === 'All' || tp.category === catFilter;
      return mq && mc;
    });
  }, [templates, search, catFilter]);

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('templates.title')}</h2><p>{templates?.length ?? 0} {t('templates.count')}</p></div>
          <button className="primary-button" onClick={onAdd}><Plus size={16} /> {t('templates.new')}</button>
        </div>
        <div className="toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filter templates by category">
            {categories.map((c) => (
              <button key={c} role="tab" aria-selected={catFilter === c} className={catFilter === c ? 'selected' : ''} onClick={() => setCatFilter(c)}>{c === 'All' ? t('templates.allCats') : c}</button>
            ))}
          </div>
          <label className="search-box"><Search size={16} /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('templates.search')} aria-label={t('templates.search')} /></label>
        </div>
        <div className="project-grid">
          {loading && [0,1,2,3].map((i) => <SkeletonCard key={i} />)}
          {error && <ErrorState message={error} onRetry={onRetry} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState icon={<Grid2X2 size={24} />} title={search ? t('templates.noResults') : t('templates.noTemplates')} message={search ? t('projects.tryAnother') : t('templates.createFirst')} action={{ label: t('templates.new'), onClick: onAdd }} />
          )}
          {!loading && !error && filtered.map((tpl) => (
            <article key={tpl.id} className="project-card template-card">
              <div className="project-image"><img src={tpl.image_url} alt={tpl.name} loading="lazy" /><div className="image-overlay" /><span className="template-duration">{tpl.duration}</span></div>
              <div className="project-info"><div className="project-info-text"><h3 title={tpl.name}>{tpl.name}</h3><p>{tpl.category} · {tpl.uses} uses</p></div></div>
              <p className="template-desc">{tpl.description}</p>
              <div className="template-footer"><button className="template-use" onClick={() => onUse(tpl)}><Sparkles size={14} /> {t('templates.use')}</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
