export interface Song {
  id: string;
  title: string;
  content: string;
  artist: string | null;
  original_key: string | null;
  tempo: number | null;
  genre: string | null;
  is_public: boolean;
  owner_id: string;
  parent_song_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSongDTO {
  title: string;
  content: string;
  artist?: string;
  original_key?: string;
  tempo?: number;
  genre?: string;
  is_public?: boolean;
}

export interface UpdateSongDTO {
  title?: string;
  content?: string;
  artist?: string;
  original_key?: string;
  tempo?: number;
  genre?: string;
  is_public?: boolean;
}

export interface SongMetadata {
  originalKey: string;
  tempo?: number;
  artist?: string;
  genre?: string;
}
