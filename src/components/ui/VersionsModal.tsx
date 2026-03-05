import { useEffect, useState } from 'react';
import { Modal } from '../ui';
import { getSongVersions, type SongVersion } from '../../services/songService';
import { ClockIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { VersionDiffModal } from './VersionDiffModal';

interface VersionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

export function VersionsModal({ isOpen, onClose, songId }: VersionsModalProps) {
  const [versions, setVersions] = useState<SongVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (isOpen && songId) {
      loadVersions();
    }
  }, [isOpen, songId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedVersions([]);
      setShowDiff(false);
    }
  }, [isOpen]);

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

  const toggleVersion = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const compareVersions = () => {
    if (selectedVersions.length === 2) {
      setShowDiff(true);
    }
  };

  const getSelectedVersionData = (index: number) => {
    if (selectedVersions[index]) {
      const v = versions.find(v => v.id === selectedVersions[index]);
      if (v) {
        return { content: v.content, version_number: v.version_number };
      }
    }
    return null;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Historial de Versiones">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No hay versiones guardadas.
              <br />
              <span className="text-sm">
                Las versiones se guardan automáticamente al editar.
              </span>
            </div>
          ) : (
            <>
              {versions.length > 1 && selectedVersions.length > 0 && (
                <div className="mb-3">
                  <button
                    onClick={compareVersions}
                    disabled={selectedVersions.length !== 2}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                      selectedVersions.length === 2
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Comparar versiones
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {selectedVersions.length}/2 seleccionadas
                  </p>
                </div>
              )}
              {versions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => toggleVersion(version.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedVersions.includes(version.id)
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedVersions.includes(version.id) && (
                        <CheckIcon className="h-4 w-4 text-primary-600" />
                      )}
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Versión {version.version_number}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(version.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Modal>

      <VersionDiffModal
        isOpen={showDiff}
        onClose={() => setShowDiff(false)}
        oldVersion={getSelectedVersionData(0)}
        newVersion={getSelectedVersionData(1)}
      />
    </>
  );
}
