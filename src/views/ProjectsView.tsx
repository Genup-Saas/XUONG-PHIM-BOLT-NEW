import { useMemo, useState } from 'react';
import { ArrowUpRight, Film, ListFilter, Plus, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import type { Project, ProjectStatus } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonCard, EmptyState, ErrorState } from '@/components/States';

type ProjectsViewProps = {
  projects: Project[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate: () => void;
  onPreview: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onToggleFeatured: (p: Project) => void;
  onToggleRender: (p: Project) => void;
};

type FilterKey = 'all' | 'ready' | 'rendering' | 'draft';

export function ProjectsView({
  projects, loading, error, onRetry, onCreate, onPreview, onEdit, onDelete, onToggleFeatured, onToggleRender,
}: ProjectsViewProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const filterLabels: Record<FilterKey, string> = {
    all: t('projects.filterAll'),
    ready: 'Ready',
    rendering: 'Rendering',
    draft: 'Draft',
  };
  const statusMap: Record<FilterKey, ProjectStatus | null> = {
    all: null, ready: 'Ready', rendering: 'Rendering', draft: 'Draft',
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const status = statusMap[filter];
    return (projects ?? []).filter((p) => {
      const matchesQuery = !query || `${p.title} ${p.type}`.toLowerCase().includes(query);
      const matchesFilter = !status || p.status === status;
      return matchesQuery && matchesFilter;
    });
  }, [projects, filter, search]);

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('projects.all')}</h2><p>{projects?.length ?? 0} {t('projects.count')}</p></div>
          <button className="primary-button" onClick={onCreate}><Plus size={16} /> {t('hero.newCreation')}</button>
        </div>
        <div className="toolbar">
          <div className="filter-tabs" role="tablist" aria-label="Filter projects by status">
            {(Object.keys(filterLabels) as FilterKey[]).map((key) => (
              <button key={key} role="tab" aria-selected={filter === key} className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)}>{filterLabels[key]}</button>
            ))}
          </div>
          <label className="search-box"><Search size={16} /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('projects.search')} aria-label={t('projects.search')} /></label>
          <button className="filter-button" onClick={onCreate}><ListFilter size={16} /> <span>{t('projects.filter')}</span></button>
        </div>
        <div className="project-grid">
          {loading && [0,1,2,3].map((i) => <SkeletonCard key={i} />)}
          {error && <ErrorState message={error} onRetry={onRetry} />}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState icon={<Film size={24} />} title={search ? t('projects.noResults') : t('projects.noProjects')} message={search ? t('projects.tryAnother') : t('projects.createFirst')} action={{ label: t('hero.newCreation'), onClick: onCreate }} />
          )}
          {!loading && !error && filtered.map((project) => (
            <ProjectCard key={project.id} project={project} onPreview={onPreview} onEdit={onEdit} onDelete={onDelete} onToggleFeatured={onToggleFeatured} onToggleRender={onToggleRender} />
          ))}
        </div>
      </section>
    </div>
  );
}
