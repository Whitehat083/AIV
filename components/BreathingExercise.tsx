import React, { useState, useEffect } from 'react';

interface BreathingExerciseProps {
  durationInSeconds: number;
  onComplete: () => void;
}

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ durationInSeconds, onComplete }) => {
  const [phase, setPhase] = useState('Inspire');
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const cycleTime = 12; // 4s in, 2s hold, 6s out

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setPhase('Inspire');
      setTimeout(() => setPhase('Segure'), 4000);
      setTimeout(() => setPhase('Expire'), 6000);
    }, cycleTime * 1000);

    // Initial start
    setPhase('Inspire');
    setTimeout(() => setPhase('Segure'), 4000);
    setTimeout(() => setPhase('Expire'), 6000);

    return () => clearInterval(cycleInterval);
  }, []);

  const getAnimationClass = () => {
    switch(phase) {
      case 'Inspire': return 'scale-110';
      case 'Segure': return 'scale-110';
      case 'Expire': return 'scale-100';
      default: return '';
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-gray-800 rounded-lg text-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className={`absolute inset-0 bg-blue-200 dark:bg-blue-900 rounded-full transition-transform duration-[4000ms] ease-out ${getAnimationClass()}`}></div>
        <div className={`absolute inset-2 bg-blue-300 dark:bg-blue-800 rounded-full transition-transform duration-[4000ms] ease-out ${getAnimationClass()}`}></div>
        <div className="relative z-10">
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{phase}</p>
          <p className="text-lg text-blue-600 dark:text-blue-400">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</p>
        </div>
      </div>
      <button onClick={onComplete} className="mt-8 text-sm text-gray-500 dark:text-gray-400 hover:underline">
        Terminar sessão
      </button>
    </div>
  );
};

export default BreathingExercise;
