import { ArrowUpRight, Clock3, Film, Plus, Sparkles, Star, Video, Image, Copy, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import type { Project, Settings } from '@/lib/types';
import { ProjectCard } from '@/components/ProjectCard';
import { SkeletonCard } from '@/components/States';

type OverviewProps = {
  projects: Project[] | null;
  loading: boolean;
  error: string | null;
  settings: Settings | null;
  onRetry: () => void;
  onCreate: () => void;
  onQuickCreate: (mode: string) => void;
  onViewAll: () => void;
  onPreview: (p: Project) => void;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
  onToggleFeatured: (p: Project) => void;
  onToggleRender: (p: Project) => void;
};

export function Overview({
  projects, loading, error, settings, onRetry, onCreate, onQuickCreate, onViewAll, onPreview, onEdit, onDelete, onToggleFeatured, onToggleRender,
}: OverviewProps) {
  const { t } = useI18n();
  const readyCount = projects?.filter((p) => p.status === 'Ready').length ?? 0;
  const renderingCount = projects?.filter((p) => p.status === 'Rendering').length ?? 0;
  const featuredCount = projects?.filter((p) => p.featured).length ?? 0;
  const recent = projects?.slice(0, 4) ?? [];

  return (
    <div className="content-wrap">
      <section className="hero-section">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> {t('hero.greeting')}, {settings?.user_name?.split(' ')[0] ?? 'Creator'}</p>
          <h1>{t('hero.title1')}<br /><em>{t('hero.title2')}</em></h1>
          <p className="hero-description">{t('hero.desc')}</p>
        </div>
        <button className="primary-button hero-button" onClick={onCreate}><Plus size={18} /> {t('hero.newCreation')} <span className="shortcut">⌘ K</span></button>
      </section>

      <section className="stats-grid">
        <div className="stat-card stat-main">
          <div className="stat-icon red"><Film size={19} /></div>
          <div>
            <span className="stat-label">{t('stat.total')}</span>
            <strong>{String(projects?.length ?? 0).padStart(2, '0')}</strong>
            <span className="stat-trend"><Zap size={13} /> {readyCount} {t('stat.ready')} · {renderingCount} {t('stat.rendering')}</span>
          </div>
          <div className="sparkline"><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Clock3 size={19} /></div>
          <div>
            <span className="stat-label">{t('stat.timeSaved')}</span>
            <strong>42.8<span className="small-unit">h</span></strong>
            <span className="stat-sub">{t('stat.vsTraditional')}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Star size={19} /></div>
          <div>
            <span className="stat-label">{t('stat.featured')}</span>
            <strong>{String(featuredCount).padStart(2, '0')}<span className="small-unit">★</span></strong>
            <span className="stat-sub">{t('stat.spotlighted')}</span>
          </div>
        </div>
      </section>

      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('projects.recent')}</h2><p>{t('projects.pickup')}</p></div>
          <button className="text-button" onClick={onViewAll}>{t('projects.viewAll')} <ArrowUpRight size={15} /></button>
        </div>
        <div className="project-grid">
          {loading && [0,1,2,3].map((i) => <SkeletonCard key={i} />)}
          {error && (
            <div className="empty-state error-state">
              <div className="empty-icon error-icon">!</div>
              <strong>Something went wrong</strong>
              <span>{error}</span>
              <button className="primary-button empty-action" onClick={onRetry}>Try again</button>
            </div>
          )}
          {!loading && !error && recent.map((project) => (
            <ProjectCard key={project.id} project={project} onPreview={onPreview} onEdit={onEdit} onDelete={onDelete} onToggleFeatured={onToggleFeatured} onToggleRender={onToggleRender} />
          ))}
          {!loading && !error && recent.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><Film size={24} /></div>
              <strong>{t('projects.noProjects')}</strong>
              <span>{t('projects.createFirst')}</span>
              <button className="primary-button empty-action" onClick={onCreate}><Plus size={16} /> {t('hero.newCreation')}</button>
            </div>
          )}
        </div>
      </section>

      <section className="quick-create">
        <div className="quick-copy">
          <div className="quick-orb"><Sparkles size={22} /></div>
          <div><h3>{t('quick.title')}</h3><p>{t('quick.desc')}</p></div>
        </div>
        <div className="quick-actions">
          <button onClick={() => onQuickCreate('Text to video')}><Video size={17} /> {t('quick.textToVideo')}</button>
          <button onClick={() => onQuickCreate('Image to video')}><Image size={17} /> {t('quick.imageToVideo')}</button>
          <button onClick={() => onQuickCreate('Script to film')}><Copy size={17} /> {t('quick.scriptToFilm')}</button>
        </div>
      </section>
    </div>
  );
}
