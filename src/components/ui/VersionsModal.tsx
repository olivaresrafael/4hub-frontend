import { useEffect, useState } from 'react';
import { Modal } from '../ui';
import { getSongVersions, type SongVersion } from '../../services/songService';
import { ClockIcon } from '@heroicons/react/24/outline';

interface VersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export function VersionsModal({ isOpen, onClose, songId }: VersionsModalProps) {
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && songId) {
      loadVersions();
    }
  }, [isOpen, songId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = await getSongVersions(songId);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Historial de Versiones">
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : versions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No hay versiones guardadas.
            <br />
            <span className="text-sm">
              Guarda una versión usando el botón "Versión" al editar.
            </span>
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Versión {version.version_number}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(version.created_at)}
                </span>
              </div>
              {version.created_by && (
                <p className="text-xs text-gray-500 mt-1">
                  Guardado
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
