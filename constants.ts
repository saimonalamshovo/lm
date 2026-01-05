
import { TeamMember, Agent } from './types';

export const INITIAL_TEAM: TeamMember[] = [
  { id: 'rak', name: 'Rak', role: 'Content Creator', avatar: '🎬', color: '#f59e0b' },
  { id: 'ridu', name: 'Ridu', role: 'Video Editor', avatar: '✂️', color: '#8b5cf6' },
  { id: 'sakib', name: 'Sakib', role: 'Content Manager', avatar: '📊', color: '#3b82f6' },
  { id: 'saimon', name: 'Saimon', role: 'Operations Lead', avatar: '⚡', color: '#ef4444' },
  { id: 'emran', name: 'Emran', role: 'Call Center Manager', avatar: '📞', color: '#10b981' },
  { id: 'arefin', name: 'Arefin', role: 'Ads Manager', avatar: '📢', color: '#ec4899' }
];

export const INITIAL_AGENTS: Agent[] = [
  { id: 'afrin', name: 'Afrin', avatar: '👩‍💼', color: '#06b6d4' },
  { id: 'hridoy', name: 'Hridoy', avatar: '👨‍💼', color: '#8b5cf6' },
  { id: 'antor', name: 'Antor', avatar: '👦', color: '#f59e0b' },
  { id: 'onup', name: 'Onup', avatar: '👨', color: '#10b981' },
  { id: 'shamor', name: 'Shamor', avatar: '🧔', color: '#ef4444' }
];

export const DEFAULT_MONTHLY_TARGET = 500000;
