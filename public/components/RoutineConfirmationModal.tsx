import React from 'react';
import Modal from './Modal';
import { ResolvedRoutineItem } from '../services/geminiService';

interface RoutineConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (routine: ResolvedRoutineItem[]) => void;
  routine: ResolvedRoutineItem[];
}

const RoutineConfirmationModal: React.FC<RoutineConfirmationModalProps> = ({ isOpen, onClose, onConfirm, routine }) => {

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Rotina à Agenda">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
            Abaixo está a pré-visualização de como sua rotina será adicionada à sua agenda. A IA já resolveu possíveis conflitos de horário.
        </p>
        
        <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            {routine.length > 0 ? routine.map((item, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${item.conflictNote ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' : 'border-blue-500 bg-white dark:bg-gray-800'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.time} - {item.duration} min</p>
                            </div>
                        </div>
                    </div>
                    {item.conflictNote && (
                         <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300 border-t border-yellow-200 dark:border-yellow-700/50 pt-2">
                            <span className="font-bold">⚠️ Ajuste da IA:</span> {item.conflictNote}
                         </div>
                    )}
                </div>
            )) : <p className="text-center text-gray-500">Nenhuma rotina para exibir.</p>}
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button onClick={() => onConfirm(routine)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Confirmar e Adicionar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RoutineConfirmationModal;