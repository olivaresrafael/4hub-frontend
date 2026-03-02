import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSongsStore, useAuthStore } from '../stores';
import { Layout } from '../components/layout';
import { ChordViewer } from '../components/viewer';
import { TransposeControls } from '../components/transpose';
import { CommentsSection } from '../components/comments/CommentsSection';
import { useTransposition } from '../hooks/useTransposition';
import { Button } from '../components/ui';
import { detectKey } from '../utils/chordParser';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PencilIcon, DocumentDuplicateIcon, EyeIcon, ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { MusicalKey } from '../hooks/useTransposition';
import { incrementViewCount, getSongStats, getActivityLog, type SongStats, type ActivityLog } from '../services/songService';

export function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSong, isLoading, fetchSong, create } = useSongsStore();
  const { isAuthenticated } = useAuthStore();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [stats, setStats] = useState<SongStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  const detectedKey = currentSong ? detectKey(currentSong.content) : null;
  const originalKey = (currentSong?.original_key || detectedKey || 'C') as MusicalKey;

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
      fetchSong(id);
      incrementViewCount(id).catch(() => {});
      getSongStats(id)
        .then(setStats)
        .catch(() => {});
      getActivityLog(id)
        .then(setActivity)
        .catch(() => {});
    }
  }, [id, fetchSong]);

  const handleDuplicate = async () => {
    if (!currentSong || !isAuthenticated) return;

    setIsDuplicating(true);
    try {
      const newSong = await create({
        title: `${currentSong.title} (Transpuesto a ${currentKey})`,
        content: currentSong.content,
        artist: currentSong.artist || undefined,
        original_key: currentKey,
        tempo: currentSong.tempo || undefined,
        genre: currentSong.genre || undefined,
        is_public: false,
      });
      toast.success('Canción duplicada exitosamente');
      navigate(`/songs/${newSong.id}/edit`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al duplicar';
      toast.error(message);
    } finally {
      setIsDuplicating(false);
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

  if (isLoading || !currentSong) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
              <ArrowLeftIcon style={{ width: '1.25rem', height: '1.25rem' }} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentSong.title}</h1>
              {currentSong.artist && (
                <p className="text-gray-600">{currentSong.artist}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {stats && (
              <div className="flex items-center gap-3 text-sm text-gray-500 mr-4">
                <span className="flex items-center gap-1">
                  <EyeIcon style={{ width: '1rem', height: '1rem' }} />
                  {stats.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <ChatBubbleLeftIcon style={{ width: '1rem', height: '1rem' }} />
                  {stats.comments_count}
                </span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon style={{ width: '1rem', height: '1rem' }} />
                  {stats.collaborators_count}
                </span>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={handleDuplicate}
              isLoading={isDuplicating}
            >
              <DocumentDuplicateIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.25rem' }} />
              Duplicar
            </Button>
            <Button onClick={() => navigate(`/songs/${currentSong.id}/edit`)}>
              <PencilIcon style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.25rem' }} />
              Editar
            </Button>
          </div>
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

          {(currentSong.original_key || currentSong.tempo || currentSong.genre) && (
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              {currentSong.original_key && (
                <span>Tonalidad: {currentSong.original_key}</span>
              )}
              {currentSong.tempo && (
                <span>Tempo: {currentSong.tempo} BPM</span>
              )}
              {currentSong.genre && (
                <span>Género: {currentSong.genre}</span>
              )}
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
              content={currentSong.content}
              semitones={semitones}
              useFlats={useFlats}
            />
          </div>

          {activity.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-2 text-sm text-gray-600">Actividad reciente</h3>
              <div className="space-y-2">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="text-sm flex items-center gap-2 text-gray-500">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>{item.action}</span>
                    {item.profiles?.username && (
                      <span className="text-gray-400">por {item.profiles.username}</span>
                    )}
                    <span className="text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <CommentsSection songId={currentSong.id} />
        )}
      </div>
    </Layout>
  );
}
