import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Project, Asset, Template, Settings, Script, Character, HistoryEntry, CreateMode, ProjectStatus } from './types';
import { SAMPLE_IMAGES } from './types';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

function useAsync<T>(
  fetcher: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[] = [],
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => setRefetchCount((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher().then((result) => {
      if (cancelled) return;
      setState({ data: result.data, loading: false, error: result.error });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchCount]);

  return { ...state, refetch };
}

export function useProjects() {
  return useAsync<Project[]>(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Project[], error: null };
  });
}

export async function createProject(input: {
  title: string;
  type: string;
  prompt: string;
  mode: CreateMode;
  resolution: string;
  aspect_ratio: string;
}): Promise<{ data: Project | null; error: string | null }> {
  const imageUrl = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
  const { data, error } = await supabase
    .from('projects')
    .insert({
      title: input.title,
      type: input.type,
      status: 'Rendering' as ProjectStatus,
      prompt: input.prompt,
      image_url: imageUrl,
      progress: 0,
      featured: false,
      duration: '00:30',
      resolution: input.resolution,
      aspect_ratio: input.aspect_ratio,
    })
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Project, error: null };
}

export async function updateProject(
  id: string,
  updates: Partial<Project>,
): Promise<{ data: Project | null; error: string | null }> {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Project, error: null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function toggleFeatured(project: Project): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('projects')
    .update({ featured: !project.featured, updated_at: new Date().toISOString() })
    .eq('id', project.id);
  return { error: error?.message ?? null };
}

export function useAssets() {
  return useAsync<Asset[]>(async () => {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Asset[], error: null };
  });
}

export async function createAsset(input: {
  name: string;
  type: string;
  url: string;
  size: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('assets').insert(input);
  return { error: error?.message ?? null };
}

export async function deleteAsset(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('assets').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export function useTemplates() {
  return useAsync<Template[]>(async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('uses', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Template[], error: null };
  });
}

export async function useTemplate(template: Template): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('templates')
    .update({ uses: template.uses + 1 })
    .eq('id', template.id);
  return { error: error?.message ?? null };
}

export function useSettings() {
  return useAsync<Settings>(async () => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data as Settings, error: null };
  });
}

export async function updateSettings(
  updates: Partial<Settings>,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', 1);
  return { error: error?.message ?? null };
}

// Scripts
export function useScripts() {
  return useAsync<Script[]>(async () => {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Script[], error: null };
  });
}

export async function createScript(input: {
  title: string;
  content: string;
}): Promise<{ data: Script | null; error: string | null }> {
  const { data, error } = await supabase
    .from('scripts')
    .insert(input)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Script, error: null };
}

export async function updateScript(
  id: string,
  updates: Partial<Script>,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('scripts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteScript(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('scripts').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Characters
export function useCharacters() {
  return useAsync<Character[]>(async () => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as Character[], error: null };
  });
}

export async function createCharacter(input: {
  name: string;
  description: string;
  image_url: string;
  role: string;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('characters').insert(input);
  return { error: error?.message ?? null };
}

export async function deleteCharacter(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('characters').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// History
export function useHistory() {
  return useAsync<HistoryEntry[]>(async () => {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { data: null, error: error.message };
    return { data: data as HistoryEntry[], error: null };
  });
}

export async function addHistoryEntry(input: {
  action_type: string;
  entity_name: string;
  credits_used: number;
  detail: string;
}): Promise<void> {
  await supabase.from('history').insert(input);
}
