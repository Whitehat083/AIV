import React from 'react';
import { Mood } from '../types';

interface MoodCheckinModalProps {
  onClose: () => void;
  onSubmit: (mood: Mood) => void;
}

const moods: { type: Mood; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😀', label: 'Feliz' },
  { type: 'neutral', emoji: '😐', label: 'Neutro' },
  { type: 'sad', emoji: '😞', label: 'Triste' },
  { type: 'tired', emoji: '😴', label: 'Cansado' },
  { type: 'stressed', emoji: '😡', label: 'Estressado' },
];

const MoodCheckinModal: React.FC<MoodCheckinModalProps> = ({ onClose, onSubmit }) => {

  const handleMoodSelect = (mood: Mood) => {
    onSubmit(mood);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm text-center p-8 transform transition-transform duration-300 scale-100"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Como você está se sentindo hoje?</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Seu check-in diário nos ajuda a personalizar sua jornada.</p>

        <div className="flex justify-around items-center">
            {moods.map(({ type, emoji, label }) => (
                <button 
                    key={type}
                    onClick={() => handleMoodSelect(type)}
                    className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-transform transform hover:scale-110"
                    aria-label={label}
                >
                    <span className="text-5xl">{emoji}</span>
                    <span className="text-xs font-medium">{label}</span>
                </button>
            ))}
        </div>
        
        <button 
            onClick={onClose} 
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline mt-8"
            aria-label="Pular check-in de humor"
        >
            Pular por agora
        </button>

      </div>
    </div>
  );
};

export default MoodCheckinModal;