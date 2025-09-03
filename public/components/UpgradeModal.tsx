import React from 'react';
import Modal from './Modal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✨ Desbloqueie o Poder Total da IA">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
            Para acessar esta funcionalidade e transformar sua produtividade, faça o upgrade para o Premium.
        </p>
        
        <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-3 mb-6">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">Com o Premium, você terá:</h3>
            <ul className="space-y-2">
                <li className="flex items-center gap-3">
                    <span className="text-green-500">✔️</span>
                    <span className="text-gray-700 dark:text-gray-300">Uso **ilimitado** da IA para todas as funcionalidades.</span>
                </li>
                <li className="flex items-center gap-3">
                    <span className="text-green-500">✔️</span>
                    <span className="text-gray-700 dark:text-gray-300">Geração de Rotinas Inteligentes a qualquer momento.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <span className="text-green-500">✔️</span>
                    <span className="text-gray-700 dark:text-gray-300">Insights emocionais e sugestões diárias.</span>
                </li>
                 <li className="flex items-center gap-3">
                    <span className="text-green-500">✔️</span>
                     <span className="text-gray-700 dark:text-gray-300">Acesso antecipado a novas funcionalidades de IA.</span>
                </li>
            </ul>
        </div>

        <button 
            onClick={onUpgrade} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-all transform hover:scale-105"
        >
            Fazer Upgrade para Premium
        </button>
        <button 
            onClick={onClose} 
            className="mt-3 text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
            Continuar no plano gratuito
        </button>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
