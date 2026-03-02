import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { getShareTokens, createShareToken, deleteShareToken } from '../../services/songService';
import type { ShareToken } from '../../services/songService';
import toast from 'react-hot-toast';
import { TrashIcon, ClipboardIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { ChangeEvent } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export function ShareModal({ isOpen, onClose, songId }: ShareModalProps) {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (isOpen && songId) {
      loadTokens();
    }
  }, [isOpen, songId]);

  const loadTokens = async () => {
    setIsLoading(true);
    try {
      const data = await getShareTokens(songId);
      setTokens(data);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateToken = async () => {
    setIsCreating(true);
    try {
      const token = await createShareToken(songId, accessCode ? { access_code: accessCode } : undefined);
      setTokens((prev) => [token, ...prev]);
      setAccessCode('');
      toast.success('Link de compartición creado');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear link';
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (!window.confirm('¿Eliminar este link de compartición?')) return;

    try {
      await deleteShareToken(songId, tokenId);
      setTokens((prev) => prev.filter((t) => t.id !== tokenId));
      toast.success('Link eliminado');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(message);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Copiado al portapapeles');
  };

  const baseUrl = window.location.origin;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartir Canción">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Código de acceso (opcional)"
            value={accessCode}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAccessCode(e.target.value)}
          />
          <Button onClick={handleCreateToken} isLoading={isCreating}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : tokens.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No hay links de compartición. Crea uno para compartir tu canción.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-mono truncate">
                    {baseUrl}/share/{token.token}
                  </p>
                  {token.access_code && (
                    <p className="text-xs text-gray-500">
                      Código: {token.access_code}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`${baseUrl}/share/${token.token}`)}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteToken(token.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>Nota:</strong> También puedes marcar la canción como pública para que cualquiera pueda encontrarla en "Explorar".
          </p>
        </div>
      </div>
    </Modal>
  );
}
