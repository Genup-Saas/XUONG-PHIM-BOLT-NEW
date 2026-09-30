import { useMemo, useState } from 'react';
import { FileText, Plus, Save, Search, Trash2 } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { useScripts, createScript, updateScript, deleteScript } from '@/lib/hooks';
import { useToast } from '@/lib/toast';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/States';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { timeAgo } from '@/lib/types';
import type { Script } from '@/lib/types';

export function ScriptWriterView() {
  const { t } = useI18n();
  const { notify } = useToast();
  const scriptsState = useScripts();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Script | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Script | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (scriptsState.data ?? []).filter((s) => !q || s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
  }, [scriptsState.data, search]);

  function openNew() {
    setEditing(null);
    setEditId(null);
    setEditTitle('');
    setEditContent('');
    setError(null);
  }

  function openEdit(s: Script) {
    setEditing(s);
    setEditId(s.id);
    setEditTitle(s.title);
    setEditContent(s.content);
    setError(null);
  }

  async function handleSave() {
    if (editTitle.trim().length < 3) return;
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        const { error: err } = await updateScript(editId, { title: editTitle.trim(), content: editContent });
        if (err) throw new Error(err);
      } else {
        const { error: err } = await createScript({ title: editTitle.trim(), content: editContent });
        if (err) throw new Error(err);
      }
      scriptsState.refetch();
      setEditId(null);
      setEditTitle('');
      setEditContent('');
      notify(t('toast.scriptSaved'), 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error: err } = await deleteScript(deleteTarget.id);
    setDeleting(false);
    if (err) { notify(`${t('toast.failed')}: ${err}`, 'error'); return; }
    setDeleteTarget(null);
    scriptsState.refetch();
    notify(`${deleteTarget.title} ${t('toast.scriptDeleted').toLowerCase()}`, 'success');
  }

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('script.title')}</h2><p>{t('script.desc')}</p></div>
          <button className="primary-button" onClick={openNew}><Plus size={16} /> {t('script.new')}</button>
        </div>
        <div className="toolbar">
          <label className="search-box"><Search size={16} /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('script.search')} aria-label={t('script.search')} /></label>
        </div>
        <div className="script-list">
          {scriptsState.loading && [0,1,2].map((i) => <SkeletonCard key={i} />)}
          {scriptsState.error && <ErrorState message={scriptsState.error} onRetry={scriptsState.refetch} />}
          {!scriptsState.loading && !scriptsState.error && filtered.length === 0 && (
            <EmptyState icon={<FileText size={24} />} title={search ? t('script.noResults') : t('script.noScripts')} message={search ? t('script.tryAnother') : t('script.createFirst')} action={{ label: t('script.new'), onClick: openNew }} />
          )}
          {!scriptsState.loading && !scriptsState.error && filtered.map((s) => (
            <article key={s.id} className="script-card" onClick={() => openEdit(s)}>
              <div className="script-card-icon"><FileText size={18} /></div>
              <div className="script-card-body">
                <h3>{s.title}</h3>
                <p>{s.content.slice(0, 120) || '…'}</p>
                <span className="script-card-meta">{t('preview.updated')} {timeAgo(s.updated_at)}</span>
              </div>
              <button className="script-delete" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} aria-label={`Delete ${s.title}`}><Trash2 size={15} /></button>
            </article>
          ))}
        </div>
      </section>

      <Modal open={!!editId || (editTitle !== '' && !editId)} onClose={() => { setEditId(null); setEditTitle(''); setEditContent(''); }} title={editing ? t('edit.title') : t('script.new')} maxWidth="620px">
        <div className="form-field">
          <label htmlFor="script-title">{t('create.projectTitle')}</label>
          <input id="script-title" type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={t('script.untitled')} />
          {editTitle.trim().length > 0 && editTitle.trim().length < 3 && <span className="field-error">{t('create.titleError')}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="script-content">{t('create.pasteScript')}</label>
          <textarea id="script-content" value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder={t('script.contentPlaceholder')} rows={10} />
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-footer">
          <span className="credit-note">{t('edit.savesInstantly')}</span>
          <div className="modal-footer-actions">
            <button className="ghost-button" onClick={() => { setEditId(null); setEditTitle(''); setEditContent(''); }} disabled={saving}>{t('create.cancel')}</button>
            <button className="primary-button" onClick={handleSave} disabled={editTitle.trim().length < 3 || saving} aria-busy={saving}>
              {saving ? <><span className="spinner" /> {t('script.saving')}</> : <><Save size={17} /> {t('script.save')}</>}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title={t('script.deleteConfirm')} message={t('script.deleteMsg')} confirmLabel={t('confirm.delete')} destructive loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
