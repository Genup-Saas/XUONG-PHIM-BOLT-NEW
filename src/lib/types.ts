export type ProjectStatus = 'Ready' | 'Rendering' | 'Draft';

export type Project = {
  id: string;
  title: string;
  type: string;
  status: ProjectStatus;
  prompt: string;
  image_url: string;
  progress: number;
  featured: boolean;
  duration: string;
  resolution: string;
  aspect_ratio: string;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
  project_id: string | null;
  created_at: string;
};

export type Template = {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  duration: string;
  uses: number;
  created_at: string;
};

export type Settings = {
  id: number;
  credits_used: number;
  credits_total: number;
  workspace_name: string;
  workspace_type: string;
  user_name: string;
  user_initials: string;
  user_role: string;
  created_at: string;
  updated_at: string;
};

export type Script = {
  id: string;
  title: string;
  content: string;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Character = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  role: string;
  created_at: string;
};

export type HistoryEntry = {
  id: string;
  action_type: string;
  entity_name: string;
  credits_used: number;
  detail: string;
  created_at: string;
};

export type CreateMode = 'Text to video' | 'Image to video' | 'Script to film';

export const PROJECT_TYPES = [
  'Cinematic short film',
  'Music visualizer',
  'Brand campaign',
  'Social cutdown',
  'Documentary',
  'Product showcase',
  'Tutorial',
] as const;

export const RESOLUTIONS = ['720p', '1080p', '4K'] as const;
export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '21:9', '4:5'] as const;

export const SAMPLE_IMAGES = [
  'https://images.pexels.com/photos/7991499/pexels-photo-7991499.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/31208770/pexels-photo-31208770.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10479446/pexels-photo-10479446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/39521437/pexels-photo-39521437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20596898/pexels-photo-20596898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/29147674/pexels-photo-29147674.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export const CHARACTER_IMAGES = [
  'https://images.pexels.com/photos/7991499/pexels-photo-7991499.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20596898/pexels-photo-20596898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10479446/pexels-photo-10479446.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/39521437/pexels-photo-39521437.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7991304/pexels-photo-7991304.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32800260/pexels-photo-32800260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day} days ago`;
  const wk = Math.floor(day / 7);
  if (wk < 4) return `${wk} wk ago`;
  const mo = Math.floor(day / 30);
  return `${mo} mo ago`;
}
