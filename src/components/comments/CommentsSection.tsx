import { useEffect, useState } from 'react';
import { Button, Input } from '../ui';
import { getComments, addComment, deleteComment } from '../../services/songService';
import type { Comment } from '../../services/songService';
import { useAuthStore } from '../../stores';
import toast from 'react-hot-toast';
import { TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import type { ChangeEvent } from 'react';

interface CommentsSectionProps {
  songId: string;
}

export function CommentsSection({ songId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadComments();
  }, [songId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await getComments(songId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await addComment(songId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
      toast.success('Comentario agregado');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al agregar comentario';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      await deleteComment(songId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comentario eliminado');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card">
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
        Comentarios ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Input
            placeholder="Escribe un comentario..."
            value={newComment}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Enviar
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>Cargando...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>
          No hay comentarios aún. ¡Sé el primero en comentar!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <UserIcon style={{ width: '1rem', height: '1rem', color: '#6b7280' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                    {comment.profiles?.username || 'Usuario'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', wordBreak: 'break-word' }}>
                  {comment.content}
                </p>
              </div>
              {user && comment.user_id === user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#9ca3af',
                  }}
                  title="Eliminar"
                >
                  <TrashIcon style={{ width: '1rem', height: '1rem' }} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
