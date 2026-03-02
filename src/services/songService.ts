import type { Song, CreateSongDTO, UpdateSongDTO } from '../types';
import { supabase } from './supabase';

export async function createSong(songData: CreateSongDTO): Promise<Song> {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('songs')
    .insert({
      ...songData,
      owner_id: user.user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Song;
}

export async function getSong(id: string): Promise<Song> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data as Song;
}

export async function updateSong(id: string, updates: UpdateSongDTO): Promise<Song> {
  const { data, error } = await supabase
    .from('songs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as Song;
}

export async function deleteSong(id: string): Promise<void> {
  const { error } = await supabase.from('songs').delete().eq('id', id);

  if (error) throw error;
}

export async function getUserSongs(): Promise<Song[]> {
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('owner_id', user.user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return data as Song[];
}

export async function getPublicSongs(limit = 20, offset = 0): Promise<Song[]> {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data as Song[];
}

export async function searchSongs(query: string): Promise<Song[]> {
  const { data: user } = await supabase.auth.getUser();

  let queryBuilder = supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,content.ilike.%${query}%`);

  if (user.user) {
    queryBuilder = queryBuilder.eq('owner_id', user.user.id);
  } else {
    queryBuilder = queryBuilder.eq('is_public', true);
  }

  const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

  if (error) throw error;

  return data as Song[];
}

export async function duplicateSong(songId: string): Promise<Song> {
  const originalSong = await getSong(songId);

  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const newSong: CreateSongDTO = {
    title: `${originalSong.title} (Copia)`,
    content: originalSong.content,
    artist: originalSong.artist ?? undefined,
    original_key: originalSong.original_key ?? undefined,
    tempo: originalSong.tempo ?? undefined,
    genre: originalSong.genre ?? undefined,
    is_public: false,
  };

  return createSong(newSong);
}

// =============================================
// PUBLIC SONGS (no auth required)
// =============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface PublicSong extends Song {
  owner_username?: string;
  owner_avatar?: string | null;
}

export async function getPublicSong(id: string): Promise<PublicSong> {
  const response = await fetch(`${API_URL}/songs/${id}/public`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch public song');
  }
  
  return response.json();
}

export interface PublicSongListParams {
  genre?: string;
  key?: string;
  sort?: 'recent' | 'popular';
  limit?: number;
  offset?: number;
}

export async function getPublicSongList(params: PublicSongListParams = {}): Promise<Song[]> {
  const searchParams = new URLSearchParams();
  if (params.genre) searchParams.set('genre', params.genre);
  if (params.key) searchParams.set('key', params.key);
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const response = await fetch(`${API_URL}/songs/public/list?${searchParams}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch public songs');
  }
  
  return response.json();
}

export async function forkPublicSong(id: string): Promise<Song> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${id}/public/fork`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fork song');
  }
  
  return response.json();
}

// =============================================
// SHARE TOKENS
// =============================================

export interface ShareToken {
  id: string;
  song_id: string;
  token: string;
  access_code: string | null;
  expires_at: string | null;
  created_by: string;
  created_at: string;
}

export async function createShareToken(
  songId: string, 
  options?: { access_code?: string; expires_at?: string }
): Promise<ShareToken> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify(options || {}),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create share token');
  }
  
  return response.json();
}

export async function getShareTokens(songId: string): Promise<ShareToken[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/share`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get share tokens');
  }
  
  return response.json();
}

export async function deleteShareToken(songId: string, tokenId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/share/${tokenId}`, {
    method: 'DELETE',
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete share token');
  }
}

export async function getSongByShareToken(token: string): Promise<{ song: Song; requiresAccessCode: boolean }> {
  const response = await fetch(`${API_URL}/songs/share/${token}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid share link');
  }
  
  return response.json();
}

export async function verifyShareAccessCode(token: string, accessCode: string): Promise<Song> {
  const response = await fetch(`${API_URL}/songs/share/${token}/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_code: accessCode }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid access code');
  }
  
  const data = await response.json();
  return data.song;
}

// =============================================
// COLLABORATORS
// =============================================

export interface Collaborator {
  id: string;
  song_id: string;
  user_id: string;
  permission: 'read' | 'comment' | 'edit' | 'admin';
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export async function getCollaborators(songId: string): Promise<Collaborator[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/collaborators`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get collaborators');
  }
  
  return response.json();
}

export async function addCollaborator(
  songId: string, 
  userId: string, 
  permission: 'read' | 'comment' | 'edit' | 'admin' = 'read'
): Promise<Collaborator> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/collaborators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify({ user_id: userId, permission }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add collaborator');
  }
  
  return response.json();
}

export async function removeCollaborator(songId: string, userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/collaborators/${userId}`, {
    method: 'DELETE',
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove collaborator');
  }
}

// =============================================
// SHARED SONGS
// =============================================

export interface SharedSong extends Song {
  collaborator_permission: 'read' | 'comment' | 'edit' | 'admin';
  is_collaborator: boolean;
}

export async function getSharedSongs(): Promise<SharedSong[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/shared`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get shared songs');
  }
  
  return response.json();
}

// =============================================
// COMMENTS
// =============================================

export interface Comment {
  id: string;
  song_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export async function getComments(songId: string): Promise<Comment[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/comments`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get comments');
  }
  
  return response.json();
}

export async function addComment(songId: string, content: string): Promise<Comment> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add comment');
  }
  
  return response.json();
}

export async function deleteComment(songId: string, commentId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
}

// =============================================
// ACTIVITY LOG
// =============================================

export interface ActivityLog {
  id: string;
  song_id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export async function getActivityLog(songId: string): Promise<ActivityLog[]> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/activity`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get activity log');
  }
  
  return response.json();
}

export async function logActivity(
  songId: string, 
  action: string, 
  details?: any
): Promise<ActivityLog> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
    body: JSON.stringify({ action, details }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to log activity');
  }
  
  return response.json();
}

// =============================================
// STATISTICS
// =============================================

export interface SongStats {
  view_count: number;
  share_count: number;
  comments_count: number;
  collaborators_count: number;
}

export async function incrementViewCount(songId: string): Promise<void> {
  await fetch(`${API_URL}/songs/${songId}/view`, {
    method: 'POST',
  });
}

export async function getSongStats(songId: string): Promise<SongStats> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(`${API_URL}/songs/${songId}/stats`, {
    headers: {
      ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get song stats');
  }
  
  return response.json();
}
