import { useEffect, useRef, useState } from 'react';
import {
  Edit3,
  MoreHorizontal,
  Pause,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import type { Project } from '@/lib/types';
import { timeAgo } from '@/lib/types';

type ProjectCardProps = {
  project: Project;
  onPreview: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFeatured: (project: Project) => void;
  onToggleRender: (project: Project) => void;
};

export function ProjectCard({
  project,
  onPreview,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleRender,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <article className={`project-card ${project.featured ? 'featured' : ''}`}>
      <div className="project-image">
        <img src={project.image_url} alt={project.title} loading="lazy" />
        <div className="image-overlay" />
        <button
          className="play-button"
          onClick={() => onPreview(project)}
          aria-label={`Preview ${project.title}`}
        >
          <Play size={16} fill="currentColor" />
        </button>
        {project.featured && (
          <span className="featured-tag">
            <Star size={12} fill="currentColor" /> Featured
          </span>
        )}
        {project.status === 'Rendering' && (
          <div className="rendering-bar">
            <span>Rendering {project.progress}%</span>
            <div>
              <i style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        )}
      </div>
      <div className="project-info">
        <div className="project-info-text">
          <h3 title={project.title}>{project.title}</h3>
          <p>{project.type}</p>
        </div>
        <div className="card-menu-wrap" ref={menuRef}>
          <button
            className="card-menu"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={`Options for ${project.title}`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={18} />
          </button>
          {menuOpen && (
            <div className="card-dropdown" role="menu">
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onPreview(project);
                }}
              >
                <Play size={14} /> Preview
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(project);
                }}
              >
                <Edit3 size={14} /> Edit
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleFeatured(project);
                }}
              >
                <Star size={14} /> {project.featured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onToggleRender(project);
                }}
              >
                {project.status === 'Rendering' ? (
                  <>
                    <Pause size={14} /> Pause render
                  </>
                ) : (
                  <>
                    <Play size={14} /> Start render
                  </>
                )}
              </button>
              <button
                role="menuitem"
                className="danger-item"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(project);
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="project-meta">
        <span className={`status-dot ${project.status.toLowerCase()}`} />
        <span>{project.status}</span>
        <span className="meta-separator">•</span>
        <span>{project.duration}</span>
        <span className="meta-separator">•</span>
        <span>{project.resolution}</span>
        <span className="meta-separator">•</span>
        <span>{timeAgo(project.updated_at)}</span>
      </div>
    </article>
  );
}
