import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { Layout } from '../components/layout';
import { ChordViewer } from '../components/viewer';
import { TransposeControls } from '../components/transpose';
import { useTransposition } from '../hooks/useTransposition';
import { Button } from '../components/ui';
import { detectKey } from '../utils/chordParser';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import type { MusicalKey } from '../hooks/useTransposition';
import { getPublicSong, forkPublicSong } from '../services/songService';
import type { PublicSong } from '../services/songService';

export function PublicSongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [song, setSong] = useState<PublicSong | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForking, setIsForking] = useState(false);

  const detectedKey = song ? detectKey(song.content) : null;
  const originalKey = (song?.original_key || detectedKey || 'C') as MusicalKey;

  const {
    currentKey,
    originalKey: origKey,
    useFlats,
    semitones,
    isTransposed,
    setKey,
    transposeUp,
    transposeDown,
    reset,
    toggleFlats,
  } = useTransposition(originalKey);

  useEffect(() => {
    if (id) {
      loadSong(id);
    }
  }, [id]);

  const loadSong = async (songId: string) => {
    setIsLoading(true);
    try {
      const data = await getPublicSong(songId);
      setSong(data);
    } catch (error) {
      console.error('Error loading song:', error);
      toast.error('Canción no encontrada');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFork = async () => {
    if (!id || !isAuthenticated) return;

    setIsForking(true);
    try {
      const newSong = await forkPublicSong(id);
      toast.success('Canción copiada a tu biblioteca');
      navigate(`/songs/${newSong.id}/edit`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al copiar';
      toast.error(message);
    } finally {
      setIsForking(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!song) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Canción no encontrada</p>
          <Button className="mt-4" onClick={() => navigate('/explore')}>
            Explorar canciones
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
            <Button variant="ghost" onClick={() => navigate('/explore')}>
              <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{song.title}</h1>
              {song.artist && <p className="text-gray-600">{song.artist}</p>}
              {song.owner_username && (
                <p className="text-sm text-gray-500">Por {song.owner_username}</p>
              )}
            </div>
          </div>
          {isAuthenticated && (
            <Button variant="secondary" onClick={handleFork} isLoading={isForking}>
              <DocumentDuplicateIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.25rem' }} />
              Copiar a mi biblioteca
            </Button>
          )}
        </div>

        <div className="card">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <TransposeControls
              currentKey={currentKey}
              originalKey={origKey}
              useFlats={useFlats}
              isTransposed={isTransposed}
              onKeyChange={setKey}
              onTransposeUp={transposeUp}
              onTransposeDown={transposeDown}
              onReset={reset}
              onToggleFlats={toggleFlats}
            />
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Tono original: <strong>{origKey}</strong>
              {isTransposed && (
                <span style={{ marginLeft: '0.5rem' }}>
                  → Actual: <strong style={{ color: '#f59e0b' }}>{currentKey}</strong>
                </span>
              )}
            </div>
          </div>

          {(song.original_key || song.tempo || song.genre) && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              {song.original_key && <span>Tonalidad: {song.original_key}</span>}
              {song.tempo && <span>Tempo: {song.tempo} BPM</span>}
              {song.genre && <span>Género: {song.genre}</span>}
            </div>
          )}

          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              overflow: 'auto',
            }}
          >
            <ChordViewer
              content={song.content}
              semitones={semitones}
              useFlats={useFlats}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
