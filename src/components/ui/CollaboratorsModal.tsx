import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '../ui';
import { getCollaborators, addCollaborator, removeCollaborator } from '../../services/songService';
import type { Collaborator } from '../../services/songService';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import type { ChangeEvent } from 'react';

interface CollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  songId: string;
}

const PERMISSIONS = [
  { value: 'read', label: 'Solo lectura' },
  { value: 'comment', label: 'Comentar' },
  { value: 'edit', label: 'Editar' },
  { value: 'admin', label: 'Administrador' },
];

export function CollaboratorsModal({ isOpen, onClose, songId }: CollaboratorsModalProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPermission, setNewPermission] = useState<'read' | 'comment' | 'edit' | 'admin'>('read');

  useEffect(() => {
    if (isOpen && songId) {
      loadCollaborators();
    }
  }, [isOpen, songId]);

  const loadCollaborators = async () => {
    setIsLoading(true);
    try {
      const data = await getCollaborators(songId);
      setCollaborators(data);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newEmail.trim()) {
      toast.error('Ingresa un email');
      return;
    }

    setIsAdding(true);
    try {
      await addCollaborator(songId, newEmail, newPermission);
      toast.success('Colaborador agregado');
      setNewEmail('');
      loadCollaborators();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al agregar';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!window.confirm('¿Eliminar este colaborador?')) return;

    try {
      await removeCollaborator(songId, userId);
      toast.success('Colaborador eliminado');
      loadCollaborators();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Colaboradores">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Email del colaborador"
            value={newEmail}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
            className="flex-1"
          />
          <select
            value={newPermission}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewPermission(e.target.value as typeof newPermission)}
            className="input"
            style={{ width: '140px' }}
          >
            {PERMISSIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Button onClick={handleAddCollaborator} isLoading={isAdding}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Cargando...</div>
        ) : collaborators.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No hay colaboradores. Agrega uno acima.
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {collab.profiles?.username || collab.user_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {PERMISSIONS.find(p => p.value === collab.permission)?.label}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(collab.user_id)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>Nota:</strong> Los colaboradores podrán acceder a esta canción según su permiso.
          </p>
        </div>
      </div>
    </Modal>
  );
}
