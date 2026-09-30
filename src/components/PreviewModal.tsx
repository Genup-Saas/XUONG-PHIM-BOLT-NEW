import { Play, X } from 'lucide-react';
import { Modal } from './Modal';
import { useI18n } from '@/lib/i18nContext';
import type { Project } from '@/lib/types';
import { timeAgo } from '@/lib/types';

type PreviewModalProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
};

export function PreviewModal({ open, project, onClose }: PreviewModalProps) {
  const { t } = useI18n();
  if (!project) return null;
  return (
    <Modal open={open} onClose={onClose} title={t('preview.title')} eyebrow={project.title} maxWidth="720px">
      <div className="preview-container">
        <div className="preview-frame">
          <img src={project.image_url} alt={project.title} />
          <div className="preview-overlay">
            <button className="preview-play" aria-label="Play preview"><Play size={28} fill="currentColor" /></button>
          </div>
          {project.status === 'Rendering' && <div className="preview-render-badge">Rendering {project.progress}%</div>}
        </div>
        <div className="preview-details">
          <div className="preview-detail-row"><span className="detail-label">{t('preview.status')}</span><span className={`detail-value status-${project.status.toLowerCase()}`}>{project.status}</span></div>
          <div className="preview-detail-row"><span className="detail-label">{t('preview.type')}</span><span className="detail-value">{project.type}</span></div>
          <div className="preview-detail-row"><span className="detail-label">{t('preview.duration')}</span><span className="detail-value">{project.duration}</span></div>
          <div className="preview-detail-row"><span className="detail-label">{t('preview.resolution')}</span><span className="detail-value">{project.resolution}</span></div>
          <div className="preview-detail-row"><span className="detail-label">{t('preview.aspect')}</span><span className="detail-value">{project.aspect_ratio}</span></div>
          <div className="preview-detail-row"><span className="detail-label">{t('preview.updated')}</span><span className="detail-value">{timeAgo(project.updated_at)}</span></div>
          {project.prompt && (
            <div className="preview-prompt"><span className="detail-label">{t('preview.prompt')}</span><p>{project.prompt}</p></div>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <span className="credit-note">{project.status === 'Ready' ? t('preview.readyExport') : t('preview.previewAfter')}</span>
        <button className="ghost-button" onClick={onClose}><X size={15} /> {t('preview.close')}</button>
      </div>
    </Modal>
  );
}
