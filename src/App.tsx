import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { ToastProvider, useToast } from '@/lib/toast';
import { I18nProvider, useI18n } from '@/lib/i18nContext';
import { Sidebar, type NavKey } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { CreateModal } from '@/components/CreateModal';
import { EditModal } from '@/components/EditModal';
import { PreviewModal } from '@/components/PreviewModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Overview } from '@/views/Overview';
import { ProjectsView } from '@/views/ProjectsView';
import { AssetsView } from '@/views/AssetsView';
import { TemplatesView } from '@/views/TemplatesView';
import { ScriptWriterView } from '@/views/ScriptWriterView';
import { CharactersView } from '@/views/CharactersView';
import { HistoryView } from '@/views/HistoryView';
import { SettingsView } from '@/views/SettingsView';
import {
  useProjects, useAssets, useTemplates, useSettings,
  createProject, updateProject, deleteProject, toggleFeatured,
  createAsset, deleteAsset, useTemplate, updateSettings, addHistoryEntry,
} from '@/lib/hooks';
import type { Project, Asset, Template, Settings, CreateMode } from '@/lib/types';

function AppContent() {
  const { t } = useI18n();
  const { notify } = useToast();
  const [activeNav, setActiveNav] = useState<NavKey>('Overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [assetDeleteTarget, setAssetDeleteTarget] = useState<Asset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const projectsState = useProjects();
  const assetsState = useAssets();
  const templatesState = useTemplates();
  const settingsState = useSettings();

  const renderingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const simulateRendering = useCallback(() => {
    const rendering = projectsState.data?.filter((p) => p.status === 'Rendering' && p.progress < 100);
    if (!rendering || rendering.length === 0) return;
    rendering.forEach(async (p) => {
      const newProgress = Math.min(100, p.progress + Math.floor(Math.random() * 8) + 3);
      const newStatus = newProgress >= 100 ? 'Ready' : 'Rendering';
      await updateProject(p.id, { progress: newProgress, status: newStatus });
    });
    projectsState.refetch();
  }, [projectsState]);

  useEffect(() => {
    renderingInterval.current = setInterval(simulateRendering, 2500);
    return () => { if (renderingInterval.current) clearInterval(renderingInterval.current); };
  }, [simulateRendering]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCreateOpen(true); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleCreate = async (input: { title: string; type: string; prompt: string; mode: CreateMode; resolution: string; aspect_ratio: string }) => {
    const { data, error } = await createProject(input);
    if (error) throw new Error(error);
    setCreateOpen(false);
    projectsState.refetch();
    settingsState.refetch();
    await addHistoryEntry({ action_type: 'create', entity_name: input.title, credits_used: 40, detail: `${input.mode} — ${input.resolution}, ${input.aspect_ratio}` });
    notify(`"${data?.title}" ${t('toast.nowRendering')}`, 'success');
  };

  const handleEditSave = async (id: string, updates: Partial<Project>) => {
    const { error } = await updateProject(id, updates);
    if (error) throw new Error(error);
    setEditProject(null);
    projectsState.refetch();
    notify(t('toast.updated'), 'success');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteProject(deleteTarget.id);
    setDeleting(false);
    if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
    setDeleteTarget(null);
    projectsState.refetch();
    notify(`"${deleteTarget.title}" ${t('toast.deleted')}`, 'success');
  };

  const handleToggleFeatured = async (project: Project) => {
    const { error } = await toggleFeatured(project);
    if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
    projectsState.refetch();
    notify(project.featured ? t('toast.unfeatured') : t('toast.featured'), 'success');
  };

  const handleToggleRender = async (project: Project) => {
    if (project.status === 'Rendering') {
      const { error } = await updateProject(project.id, { status: 'Draft', progress: project.progress });
      if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
      projectsState.refetch();
      notify(t('toast.renderPaused'), 'info');
    } else {
      const { error } = await updateProject(project.id, { status: 'Rendering', progress: project.progress || 5 });
      if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
      projectsState.refetch();
      notify(t('toast.renderStarted'), 'success');
    }
  };

  const handleAssetDelete = async () => {
    if (!assetDeleteTarget) return;
    setDeleting(true);
    const { error } = await deleteAsset(assetDeleteTarget.id);
    setDeleting(false);
    if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
    setAssetDeleteTarget(null);
    assetsState.refetch();
    notify(`"${assetDeleteTarget.name}" ${t('toast.deleted')}`, 'success');
  };

  const handleAssetAdd = async () => {
    const samples = [
      { name: 'Aurora landscape', type: 'image', url: 'https://images.pexels.com/photos/10479446/pexels-photo-10479446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', size: '4.3 MB' },
      { name: 'City pulse', type: 'image', url: 'https://images.pexels.com/photos/32800260/pexels-photo-32800260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', size: '5.0 MB' },
      { name: 'Mountain dawn', type: 'image', url: 'https://images.pexels.com/photos/13327883/pexels-photo-13327883.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', size: '3.9 MB' },
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    const { error } = await createAsset(pick);
    if (error) { notify(`${t('toast.uploadFailed')}: ${error}`, 'error'); return; }
    assetsState.refetch();
    notify(`"${pick.name}" ${t('toast.uploaded')}`, 'success');
  };

  const handleUseTemplate = async (tpl: Template) => {
    const { error } = await useTemplate(tpl);
    if (error) { notify(`${t('toast.failed')}: ${error}`, 'error'); return; }
    templatesState.refetch();
    setCreateOpen(true);
    notify(`"${tpl.name}" ${t('toast.templateSelected')}`, 'success');
  };

  const handleSettingsSave = async (updates: Partial<Settings>) => {
    const { error } = await updateSettings(updates);
    if (error) throw new Error(error);
    settingsState.refetch();
    notify(t('toast.settingsSaved'), 'success');
  };

  const handleQuickCreate = (mode: string) => {
    notify(`${mode} ${t('toast.modeSelected')}`, 'info');
    setCreateOpen(true);
  };

  const handleUpgrade = () => { notify(t('toast.upgradeSoon'), 'info'); };
  const handleHelp = () => { notify(t('toast.helpCenter'), 'info'); };
  const handleNotification = () => {
    const rendering = projectsState.data?.filter((p) => p.status === 'Rendering').length ?? 0;
    notify(rendering > 0 ? `${rendering} ${rendering > 1 ? t('toast.projects') : t('toast.project')} ${t('toast.renderingCount')}` : t('toast.noNotifications'), 'info');
  };

  const projectCount = projectsState.data?.length ?? 0;

  return (
    <div className="app-shell">
      <Sidebar
        activeNav={activeNav} onNavChange={setActiveNav} onCreateClick={() => setCreateOpen(true)}
        onUpgradeClick={handleUpgrade} settings={settingsState.data} projectCount={projectCount}
        mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)}
      />
      <main className="main-content">
        <Topbar
          activeNav={activeNav} settings={settingsState.data}
          notificationCount={projectsState.data?.filter((p) => p.status === 'Rendering').length ?? 0}
          onMobileMenu={() => setMobileNavOpen(true)} onNotificationClick={handleNotification} onHelpClick={handleHelp}
        />
        {activeNav === 'Overview' && (
          <Overview
            projects={projectsState.data} loading={projectsState.loading} error={projectsState.error}
            settings={settingsState.data} onRetry={projectsState.refetch} onCreate={() => setCreateOpen(true)}
            onQuickCreate={handleQuickCreate} onViewAll={() => setActiveNav('My projects')}
            onPreview={(p) => setPreviewProject(p)} onEdit={(p) => setEditProject(p)} onDelete={(p) => setDeleteTarget(p)}
            onToggleFeatured={handleToggleFeatured} onToggleRender={handleToggleRender}
          />
        )}
        {activeNav === 'My projects' && (
          <ProjectsView
            projects={projectsState.data} loading={projectsState.loading} error={projectsState.error}
            onRetry={projectsState.refetch} onCreate={() => setCreateOpen(true)}
            onPreview={(p) => setPreviewProject(p)} onEdit={(p) => setEditProject(p)} onDelete={(p) => setDeleteTarget(p)}
            onToggleFeatured={handleToggleFeatured} onToggleRender={handleToggleRender}
          />
        )}
        {activeNav === 'Assets' && (
          <AssetsView
            assets={assetsState.data} loading={assetsState.loading} error={assetsState.error}
            onRetry={assetsState.refetch} onAdd={handleAssetAdd} onDelete={(a) => setAssetDeleteTarget(a)}
          />
        )}
        {activeNav === 'Templates' && (
          <TemplatesView
            templates={templatesState.data} loading={templatesState.loading} error={templatesState.error}
            onRetry={templatesState.refetch} onUse={handleUseTemplate}
            onAdd={() => notify(t('toast.upgradeSoon'), 'info')}
          />
        )}
        {activeNav === 'Script writer' && <ScriptWriterView />}
        {activeNav === 'Characters' && <CharactersView />}
        {activeNav === 'History' && <HistoryView />}
        {activeNav === 'Settings' && (
          <SettingsView
            settings={settingsState.data} loading={settingsState.loading} error={settingsState.error}
            onRetry={settingsState.refetch} onSave={handleSettingsSave}
          />
        )}
        <button className="fab" onClick={() => setCreateOpen(true)} aria-label={t('hero.newCreation')}>
          <Plus size={22} />
        </button>
      </main>

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      <EditModal open={!!editProject} project={editProject} onClose={() => setEditProject(null)} onSave={handleEditSave} />
      <PreviewModal open={!!previewProject} project={previewProject} onClose={() => setPreviewProject(null)} />
      <ConfirmDialog open={!!deleteTarget} title={t('confirm.deleteProject')} message={t('confirm.deleteProjectMsg')} confirmLabel={t('confirm.delete')} destructive loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      <ConfirmDialog open={!!assetDeleteTarget} title={t('confirm.deleteProject')} message={`"${assetDeleteTarget?.name}" — ${t('confirm.deleteProjectMsg')}`} confirmLabel={t('confirm.delete')} destructive loading={deleting} onConfirm={handleAssetDelete} onCancel={() => setAssetDeleteTarget(null)} />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </I18nProvider>
  );
}
