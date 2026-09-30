import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from './Modal';
import { useI18n } from '@/lib/i18nContext';
import type { Project } from '@/lib/types';
import { PROJECT_TYPES, RESOLUTIONS, ASPECT_RATIOS } from '@/lib/types';

type EditModalProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Project>) => Promise<void>;
};

export function EditModal({ open, project, onClose, onSave }: EditModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>(PROJECT_TYPES[0]);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('00:30');
  const [resolution, setResolution] = useState('1080p');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && project) {
      setTitle(project.title);
      setType(project.type);
      setPrompt(project.prompt);
      setDuration(project.duration);
      setResolution(project.resolution);
      setAspectRatio(project.aspect_ratio);
      setError(null);
    }
  }, [open, project]);

  const titleErr = title.trim().length > 0 && title.trim().length < 3 ? t('edit.titleError') : '';
  const canSave = title.trim().length >= 3 && !loading;

  async function handleSave() {
    if (!project || !canSave) return;
    setLoading(true);
    setError(null);
    try {
      await onSave(project.id, { title: title.trim(), type, prompt: prompt.trim(), duration, resolution, aspect_ratio: aspectRatio });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('edit.title')} eyebrow={project?.title} maxWidth="620px">
      <div className="form-field">
        <label htmlFor="edit-title">{t('create.projectTitle')}</label>
        <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!titleErr} />
        {titleErr && <span className="field-error">{titleErr}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="edit-prompt">{t('edit.promptLabel')}</label>
        <textarea id="edit-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="…" />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="edit-type">{t('create.projectType')}</label>
          <select id="edit-type" value={type} onChange={(e) => setType(e.target.value)}>
            {PROJECT_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="edit-dur">{t('edit.duration')}</label>
          <input id="edit-dur" type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="00:30" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="edit-res">{t('create.resolution')}</label>
          <select id="edit-res" value={resolution} onChange={(e) => setResolution(e.target.value)}>
            {RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="edit-ar">{t('create.aspectRatio')}</label>
          <select id="edit-ar" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      {error && <div className="modal-error">{error}</div>}
      <div className="modal-footer">
        <span className="credit-note">{t('edit.savesInstantly')}</span>
        <div className="modal-footer-actions">
          <button className="ghost-button" onClick={handleClose} disabled={loading}>{t('create.cancel')}</button>
          <button className="primary-button" onClick={handleSave} disabled={!canSave} aria-busy={loading}>
            {loading ? <><span className="spinner" /> {t('edit.saving')}</> : <><Save size={17} /> {t('edit.save')}</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
