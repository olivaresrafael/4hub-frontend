import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../types';
import { useSongsStore, useAuthStore } from '../stores';
import { Layout } from '../components/layout';
import { Button, Card, CardHeader, CardContent, CardFooter, Input, Select } from '../components/ui';
import { MusicalNoteIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import { getSharedSongs } from '../services';
import toast from 'react-hot-toast';

type SongFilter = 'all' | 'owned' | 'shared';

export function SongsPage() {
  const navigate = useNavigate();
  const { songs, isLoading, fetchSongs, remove } = useSongsStore();
  const { profile } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SongFilter>('all');
  const [sharedSongs, setSharedSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    if (filter === 'shared') {
      loadSharedSongs();
    }
  }, [filter]);

  const loadSharedSongs = async () => {
    try {
      const data = await getSharedSongs();
      setSharedSongs(data);
    } catch (error) {
      console.error('Error loading shared songs:', error);
      toast.error('Error al cargar canciones compartidas');
    }
  };

  const getFilteredSongs = () => {
    let filtered: Song[];
    
    if (filter === 'shared') {
      filtered = sharedSongs;
    } else if (filter === 'owned') {
      filtered = songs.filter(s => !('is_collaborator' in s && s.is_collaborator));
    } else {
      filtered = songs;
    }
    
    return filtered.filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredSongs = getFilteredSongs();

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;

    setDeletingId(id);
    try {
      await remove(id);
    } catch (error) {
      console.error('Error deleting song:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Canciones</h1>
            <p className="text-gray-600">
              {profile?.username ? `Hola, ${profile.username}` : 'Bienvenido'}
            </p>
          </div>
          <Button onClick={() => navigate('/songs/new')}>
            Nueva Canción
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar canciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as SongFilter)}
            className="w-48"
          >
            <option value="all">Todas</option>
            <option value="owned">Mis canciones</option>
            <option value="shared">
              Compartidas conmigo
            </option>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12">
            <MusicalNoteIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay canciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No se encontraron resultados' : 'Comienza creando tu primera canción'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => navigate('/songs/new')}>
                Crear Canción
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                onView={() => navigate(`/songs/${song.id}/view`)}
                onEdit={() => navigate(`/songs/${song.id}/edit`)}
                onDelete={() => handleDelete(song.id)}
                isDeleting={deletingId === song.id}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

interface SongCardProps {
  song: Song & { is_collaborator?: boolean; collaborator_permission?: string };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}

function SongCard({ song, onView, onEdit, onDelete, isDeleting }: SongCardProps) {
  const isCollaborator = 'is_collaborator' in song && song.is_collaborator;
  
  return (
    <Card hoverable onClick={onEdit}>
      <CardHeader
        title={song.title}
        subtitle={song.artist || 'Sin artista'}
        action={
          <div className="flex gap-1">
            {isCollaborator && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Colaborador
              </span>
            )}
            {song.is_public && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Pública
              </span>
            )}
          </div>
        }
      />
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {song.original_key && (
            <span>Tonalidad: {song.original_key}</span>
          )}
          {song.tempo && (
            <span>{song.tempo} BPM</span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Editado {formatDate(song.updated_at)}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }} title="Ver">
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Editar">
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            disabled={isDeleting}
            title="Eliminar"
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
