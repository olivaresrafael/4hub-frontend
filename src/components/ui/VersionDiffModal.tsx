import { Modal } from './Modal';
import { diffLines, type DiffLine } from '../../utils/diff';

interface VersionDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldVersion: { content: string; version_number: number } | null;
  newVersion: { content: string; version_number: number } | null;
}

export function VersionDiffModal({ isOpen, onClose, oldVersion, newVersion }: VersionDiffModalProps) {
  const diff: DiffLine[] = oldVersion && newVersion 
    ? diffLines(oldVersion.content, newVersion.content)
    : [];

  const addedCount = diff.filter(d => d.type === 'added').length;
  const removedCount = diff.filter(d => d.type === 'removed').length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comparar Versiones" size="xl">
      {oldVersion && newVersion ? (
        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">+{addedCount} líneas añadidas</span>
            <span className="text-red-600">-{removedCount} líneas eliminadas</span>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-sm">
            {diff.map((line, index) => (
              <div
                key={index}
                className={`flex ${
                  line.type === 'added' 
                    ? 'bg-green-900/30 text-green-400' 
                    : line.type === 'removed' 
                      ? 'bg-red-900/30 text-red-400' 
                      : 'text-gray-300'
                }`}
              >
                <span className="w-8 text-gray-500 select-none text-right mr-2">
                  {line.lineNumber}
                </span>
                <span className="w-4 text-center select-none">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className="whitespace-pre-wrap">{line.content}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Selecciona dos versiones para comparar
        </div>
      )}
    </Modal>
  );
}
