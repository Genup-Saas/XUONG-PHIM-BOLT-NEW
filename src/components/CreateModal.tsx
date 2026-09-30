import { useState } from 'react';
import { Sparkles, Upload, Zap } from 'lucide-react';
import { Modal } from './Modal';
import { useI18n } from '@/lib/i18nContext';
import type { CreateMode } from '@/lib/types';
import { PROJECT_TYPES, RESOLUTIONS, ASPECT_RATIOS } from '@/lib/types';

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    type: string;
    prompt: string;
    mode: CreateMode;
    resolution: string;
    aspect_ratio: string;
  }) => Promise<void>;
};

const modes: { label: CreateMode; icon: typeof Sparkles; key: string }[] = [
  { label: 'Text to video', icon: Sparkles, key: 'quick.textToVideo' },
  { label: 'Image to video', icon: Upload, key: 'quick.imageToVideo' },
  { label: 'Script to film', icon: Sparkles, key: 'quick.scriptToFilm' },
];

export function CreateModal({ open, onClose, onCreate }: CreateModalProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<CreateMode>('Text to video');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<string>(PROJECT_TYPES[0]);
  const [resolution, setResolution] = useState<string>('1080p');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const titleErr = title.trim().length > 0 && title.trim().length < 3 ? t('create.titleError') : '';
  const promptErr = prompt.trim().length > 0 && prompt.trim().length < 10 ? t('create.promptError') : '';
  const canSubmit = title.trim().length >= 3 && prompt.trim().length >= 10 && !loading;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await onCreate({ title: title.trim(), type, prompt: prompt.trim(), mode, resolution, aspect_ratio: aspectRatio });
      setTitle(''); setPrompt(''); setMode('Text to video'); setType(PROJECT_TYPES[0]); setResolution('1080p'); setAspectRatio('16:9');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('create.failed'));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('create.title')} eyebrow={t('create.eyebrow')} maxWidth="620px">
      <div className="mode-picker">
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className={mode === item.label ? 'active' : ''} onClick={() => setMode(item.label)} aria-pressed={mode === item.label}>
              <Icon size={17} /> {t(item.key)}
            </button>
          );
        })}
      </div>
      <div className="form-field">
        <label htmlFor="create-title">{t('create.projectTitle')}</label>
        <input id="create-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('create.titlePlaceholder')} aria-invalid={!!titleErr} />
        {titleErr && <span className="field-error">{titleErr}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="create-prompt">{mode === 'Script to film' ? t('create.pasteScript') : t('create.describeVision')}</label>
        <textarea id="create-prompt" autoFocus value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t('create.beSpecific')} aria-invalid={!!promptErr} />
        {promptErr && <span className="field-error">{promptErr}</span>}
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="create-type">{t('create.projectType')}</label>
          <select id="create-type" value={type} onChange={(e) => setType(e.target.value)}>{PROJECT_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}</select>
        </div>
        <div className="form-field">
          <label htmlFor="create-res">{t('create.resolution')}</label>
          <select id="create-res" value={resolution} onChange={(e) => setResolution(e.target.value)}>{RESOLUTIONS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        </div>
        <div className="form-field">
          <label htmlFor="create-ar">{t('create.aspectRatio')}</label>
          <select id="create-ar" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>{ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        </div>
      </div>
      <div className="modal-options">
        <button type="button"><Upload size={16} /> {t('create.addReference')}</button>
        <span><span className="status-dot ready" /> {t('create.settingsReady')}</span>
      </div>
      {error && <div className="modal-error">{error}</div>}
      <div className="modal-footer">
        <span className="credit-note"><Zap size={14} /> {t('create.usesCredits')}</span>
        <div className="modal-footer-actions">
          <button className="ghost-button" onClick={handleClose} disabled={loading}>{t('create.cancel')}</button>
          <button className="primary-button" onClick={handleSubmit} disabled={!canSubmit} aria-busy={loading}>
            {loading ? <><span className="spinner" /> {t('create.generating')}</> : <><Sparkles size={17} /> {t('create.generate')}</>}
          </button>
        </div>
      </div>
    </Modal>
  );
}
