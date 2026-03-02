const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SongPreference {
  user_id: string;
  song_id: string;
  preferred_key: string | null;
  use_flats: boolean;
  created_at?: string;
  updated_at?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { supabase } = await import('./supabase');
  const { data: { session } } = await supabase.auth.getSession();
  
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
  };
}

export async function getPreference(songId: string): Promise<SongPreference | null> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/preferences/${songId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get preference');
  }

  return response.json();
}

export async function savePreference(
  songId: string,
  preferredKey: string | null,
  useFlats: boolean
): Promise<SongPreference> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/preferences/${songId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ preferred_key: preferredKey, use_flats: useFlats }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save preference');
  }

  return response.json();
}

export async function deletePreference(songId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/preferences/${songId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete preference');
  }
}
