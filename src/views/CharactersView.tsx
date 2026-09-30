import { useMemo, useState } from 'react';
import { Plus, Save, Search, Trash2, User } from 'lucide-react';
import { useI18n } from '@/lib/i18nContext';
import { useCharacters, createCharacter, deleteCharacter } from '@/lib/hooks';
import { useToast } from '@/lib/toast';
import { EmptyState, ErrorState, SkeletonCard } from '@/components/States';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { CHARACTER_IMAGES } from '@/lib/types';
import type { Character } from '@/lib/types';

export function CharactersView() {
  const { t } = useI18n();
  const { notify } = useToast();
  const charsState = useCharacters();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('Lead');
  const [imageUrl, setImageUrl] = useState(CHARACTER_IMAGES[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (charsState.data ?? []).filter((c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [charsState.data, search]);

  function openForm() {
    setName(''); setDescription(''); setRole('Lead'); setImageUrl(CHARACTER_IMAGES[Math.floor(Math.random() * CHARACTER_IMAGES.length)]);
    setError(null); setShowForm(true);
  }

  async function handleSave() {
    if (name.trim().length < 2) return;
    setSaving(true); setError(null);
    try {
      const { error: err } = await createCharacter({ name: name.trim(), description: description.trim(), image_url: imageUrl, role });
      if (err) throw new Error(err);
      charsState.refetch(); setShowForm(false);
      notify(t('toast.charSaved'), 'success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save. Try again.');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error: err } = await deleteCharacter(deleteTarget.id);
    setDeleting(false);
    if (err) { notify(`${t('toast.failed')}: ${err}`, 'error'); return; }
    setDeleteTarget(null); charsState.refetch();
    notify(`${deleteTarget.name} ${t('toast.charDeleted').toLowerCase()}`, 'success');
  }

  return (
    <div className="content-wrap">
      <section className="projects-section">
        <div className="section-header">
          <div><h2>{t('char.title')}</h2><p>{t('char.desc')}</p></div>
          <button className="primary-button" onClick={openForm}><Plus size={16} /> {t('char.new')}</button>
        </div>
        <div className="toolbar">
          <label className="search-box"><Search size={16} /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('char.search')} aria-label={t('char.search')} /></label>
        </div>
        <div className="project-grid">
          {charsState.loading && [0,1,2].map((i) => <SkeletonCard key={i} />)}
          {charsState.error && <ErrorState message={charsState.error} onRetry={charsState.refetch} />}
          {!charsState.loading && !charsState.error && filtered.length === 0 && (
            <EmptyState icon={<User size={24} />} title={search ? t('char.noResults') : t('char.noChars')} message={t('char.createFirst')} action={{ label: t('char.new'), onClick: openForm }} />
          )}
          {!charsState.loading && !charsState.error && filtered.map((c) => (
            <article key={c.id} className="project-card char-card">
              <div className="project-image"><img src={c.image_url} alt={c.name} loading="lazy" /><div className="image-overlay" /><span className="char-role-tag">{c.role}</span></div>
              <div className="project-info"><div className="project-info-text"><h3 title={c.name}>{c.name}</h3><p>{c.description.slice(0, 60) || '—'}</p></div></div>
              <div className="project-meta"><span className="status-dot ready" /><span>{c.role}</span><button className="asset-download" onClick={() => setDeleteTarget(c)} aria-label={`Delete ${c.name}`}><Trash2 size={13} /></button></div>
            </article>
          ))}
        </div>
      </section>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={t('char.new')} maxWidth="540px">
        <div className="form-field"><label htmlFor="char-name">{t('char.name')}</label><input id="char-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('char.namePlaceholder')} />{name.trim().length > 0 && name.trim().length < 2 && <span className="field-error">{t('settings.displayName')} min 2</span>}</div>
        <div className="form-field"><label htmlFor="char-desc">{t('char.description')}</label><textarea id="char-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('char.descPlaceholder')} /></div>
        <div className="form-field"><label htmlFor="char-role">{t('char.role')}</label><select id="char-role" value={role} onChange={(e) => setRole(e.target.value)}><option value="Lead">{t('char.roleLead')}</option><option value="Supporting">{t('char.roleSupporting')}</option><option value="Extra">{t('char.roleExtra')}</option></select></div>
        <div className="char-image-picker"><p>{t('create.addReference')}</p><div className="char-image-grid">{CHARACTER_IMAGES.map((url) => <button key={url} className={`char-image-option ${imageUrl === url ? 'selected' : ''}`} onClick={() => setImageUrl(url)}><img src={url} alt="" loading="lazy" /></button>)}</div></div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-footer"><span className="credit-note">{t('edit.savesInstantly')}</span><div className="modal-footer-actions"><button className="ghost-button" onClick={() => setShowForm(false)} disabled={saving}>{t('create.cancel')}</button><button className="primary-button" onClick={handleSave} disabled={name.trim().length < 2 || saving} aria-busy={saving}>{saving ? <><span className="spinner" /> {t('char.saving')}</> : <><Save size={17} /> {t('char.save')}</>}</button></div></div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title={t('char.deleteConfirm')} message={t('char.deleteMsg')} confirmLabel={t('confirm.delete')} destructive loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
