import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { UpdateSongDTO } from '../types';
import { useSongsStore } from '../stores';
import { Layout } from '../components/layout';
import { SongEditor } from '../components/editor';
import { Button, Input, Select, ShareModal, CollaboratorsModal, VersionsModal } from '../components/ui';
import { GenreSelect } from '../components/ui/GenreSelect';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, TrashIcon, ShareIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import { logActivity, createSongVersion } from '../services/songService';

const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm',
];

export function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSong, isLoading, fetchSong, update, remove } = useSongsStore();
  const [content, setContent] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    original_key: '',
    tempo: '',
    genre: '',
    is_public: false,
  });

  useEffect(() => {
    if (id) {
      fetchSong(id);
    }
  }, [id, fetchSong]);

  useEffect(() => {
    if (currentSong) {
      setContent(currentSong.content);
      setFormData({
        title: currentSong.title,
        artist: currentSong.artist || '',
        original_key: currentSong.original_key || '',
        tempo: currentSong.tempo?.toString() || '',
        genre: currentSong.genre || '',
        is_public: currentSong.is_public,
      });
    }
  }, [currentSong]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!id) return;

    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!content.trim()) {
      toast.error('El contenido de la canción es requerido');
      return;
    }

    try {
      const songData: UpdateSongDTO = {
        title: formData.title.trim(),
        content: content.trim(),
        artist: formData.artist.trim() || undefined,
        original_key: formData.original_key.trim() || undefined,
        tempo: formData.tempo ? parseInt(formData.tempo) : undefined,
        genre: formData.genre.trim() || undefined,
        is_public: formData.is_public,
      };

      await update(id, songData);
      await createSongVersion(id);
      await logActivity(id, 'edit', { title: songData.title });
      toast.success('Canción actualizada');
      navigate('/songs');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar la canción';
      toast.error(message);
    }
  };

  const handleSaveVersion = async () => {
    if (!id) return;

    try {
      await createSongVersion(id);
      toast.success('Versión guardada');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar versión';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta canción?')) return;

    try {
      await remove(id);
      toast.success('Canción eliminada');
      navigate('/songs');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar la canción';
      toast.error(message);
    }
  };

  if (!currentSong && !isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Canción no encontrada</p>
          <Button className="mt-4" onClick={() => navigate('/songs')}>
            Volver a mis canciones
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/songs')}>
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Editar Canción</h1>
            {currentSong?.parent_song_id && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                Fork
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowCollaboratorsModal(true)}>
              <UsersIcon className="h-5 w-5 mr-1" />
              Colaboradores
            </Button>
            <Button variant="secondary" onClick={() => setShowShareModal(true)}>
              <ShareIcon className="h-5 w-5 mr-1" />
              Compartir
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <TrashIcon className="h-5 w-5 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <Input
                label="Título *"
                value={formData.title}
                onChange={handleChange('title')}
                placeholder="Nombre de la canción"
              />
            </div>

            <div className="card h-[500px]">
              <SongEditor
                initialContent={content}
                onChange={setContent}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
              <div className="space-y-4">
                <Input
                  label="Artista"
                  value={formData.artist}
                  onChange={handleChange('artist')}
                  placeholder="Nombre del artista"
                />

                <Select
                  label="Tonalidad"
                  value={formData.original_key}
                  onChange={handleChange('original_key')}
                >
                  <option value="">Seleccionar...</option>
                  {MUSICAL_KEYS.map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </Select>

                <Input
                  label="Tempo (BPM)"
                  type="number"
                  value={formData.tempo}
                  onChange={handleChange('tempo')}
                  placeholder="120"
                />

                <GenreSelect
                  value={formData.genre}
                  onChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={handleChange('is_public')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700">
                    Hacer pública
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={handleSaveVersion}
                title="Guardar una versión"
                className="!px-3 !py-1.5 text-sm"
              >
                <ClockIcon className="h-4 w-4 mr-1" />
                Version
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowVersionsModal(true)}
                title="Ver historial de versiones"
                className="!px-3 !py-1.5 text-sm"
              >
                <ClockIcon className="h-4 w-4 mr-1" />
                Historial
              </Button>
              <div className="flex-1" />
              <Button
                variant="secondary"
                onClick={() => navigate('/songs')}
                className="!px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isLoading}
                className="!px-6"
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {id && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          songId={id}
        />
      )}

      {id && (
        <CollaboratorsModal
          isOpen={showCollaboratorsModal}
          onClose={() => setShowCollaboratorsModal(false)}
          songId={id}
        />
      )}

      {id && (
        <VersionsModal
          isOpen={showVersionsModal}
          onClose={() => setShowVersionsModal(false)}
          songId={id}
        />
      )}
    </Layout>
  );
}
