import React, { useState, useMemo, useEffect } from 'react';
import { PageProps, Mood, MoodLog } from '../types';
import Card from '../components/Card';
import { getTodayDateString } from '../utils/dateUtils';
import { getEmotionalInsights } from '../services/geminiService';
import BreathingExercise from '../components/BreathingExercise';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const moods: { type: Mood; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😀', label: 'Feliz' },
  { type: 'neutral', emoji: '😐', label: 'Neutro' },
  { type: 'sad', emoji: '😞', label: 'Triste' },
  { type: 'tired', emoji: '😴', label: 'Cansado' },
  { type: 'stressed', emoji: '😡', label: 'Estressado' },
];

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3.375 3.375 0 01-3.375 3.375h-2.25a3.375 3.375 0 01-3.375-3.375m9 0V3.375c0-1.036-.84-1.875-1.875-1.875h-5.25C6.84 1.5 6 2.34 6 3.375v15.375m9 0h-9" />
    </svg>
);

const moodToValue = (mood: Mood): number => {
    switch (mood) {
        case 'happy': return 5;
        case 'neutral': return 3;
        case 'stressed': return 2;
        case 'sad': return 1;
        case 'tired': return 2;
        default: return 0;
    }
};

const Wellbeing: React.FC<PageProps> = ({ weeklyChallenge, badges, addMoodLog, moodLogs }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isBreathing, setIsBreathing] = useState<number | null>(null);

  const todayStr = getTodayDateString(new Date());
  const todaysLog = moodLogs.find(log => log.date === todayStr);

  useEffect(() => {
    if (moodLogs.length > 2 && !insights) {
      setIsLoadingInsights(true);
      getEmotionalInsights(moodLogs)
        .then(setInsights)
        .finally(() => setIsLoadingInsights(false));
    }
  }, [moodLogs, insights]);


  const handleMoodSelect = (mood: Mood) => {
    if (todaysLog) return;
    setSelectedMood(mood);
  };
  
  const handleJournalSubmit = () => {
    if (selectedMood) {
      addMoodLog(selectedMood, notes);
      setConfirmationMessage('Seu diário foi registrado com sucesso!');
      setTimeout(() => {
          setConfirmationMessage(null);
          setSelectedMood(null);
          setNotes('');
      }, 3000);
    }
  };

  const moodChartData = useMemo(() => {
    const last7Days: MoodLog[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = getTodayDateString(date);
        const log = moodLogs.find(l => l.date === dateStr);
        last7Days.push(log || { date: dateStr, mood: 'neutral', notes: '' });
    }
    return last7Days.map(log => ({
        name: new Date(log.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        valor: moodToValue(log.mood)
    }));
  }, [moodLogs]);
  
  if (isBreathing) {
    return <BreathingExercise durationInSeconds={isBreathing} onComplete={() => setIsBreathing(null)} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bem-Estar & Mindfulness</h1>
        <p className="text-gray-500 dark:text-gray-400">Seu centro de saúde emocional e relaxamento.</p>
      </header>

      <Card>
        <h2 className="font-bold text-xl mb-4">Diário de Emoções</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Como você se sente hoje? Registrar suas emoções ajuda a IA a personalizar seu dia.</p>
        
        {todaysLog ? (
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">Você já registrou seu humor hoje como '{todaysLog.mood}'. Volte amanhã!</p>
            </div>
        ) : (
          <>
            <div className="flex justify-around items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                {moods.map(({ type, emoji, label }) => (
                    <button 
                        key={type}
                        onClick={() => handleMoodSelect(type)}
                        className={`flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300 transition-all transform rounded-lg p-2 ${
                          selectedMood === type 
                            ? 'text-blue-600 dark:text-blue-400 scale-110' 
                            : 'hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110'
                        }`}
                        aria-label={label}
                    >
                        <span className="text-5xl">{emoji}</span>
                        <span className="text-xs font-medium">{label}</span>
                    </button>
                ))}
            </div>
            {selectedMood && (
                <div className="mt-6 space-y-4">
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="O que está em sua mente? (opcional)"
                        rows={3}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleJournalSubmit} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Salvar Registro
                    </button>
                </div>
            )}
             {confirmationMessage && (
                <p className="text-center text-green-600 dark:text-green-400 mt-4 font-semibold animate-pulse">{confirmationMessage}</p>
            )}
          </>
        )}
      </Card>

       <Card>
            <h2 className="font-bold text-xl mb-4">Relaxamento Rápido</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tire um momento para respirar e recentralizar suas energias.</p>
            <div className="flex justify-center gap-4">
                <button onClick={() => setIsBreathing(60)} className="font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-6 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">1 Minuto</button>
                <button onClick={() => setIsBreathing(180)} className="font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-6 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">3 Minutos</button>
                <button onClick={() => setIsBreathing(300)} className="font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-6 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">5 Minutos</button>
            </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <h2 className="font-bold text-xl mb-4">Humor da Semana</h2>
              <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                      <LineChart data={moodChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 5]} hide />
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                          <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} name="Humor" />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </Card>
          <Card>
              <h2 className="font-bold text-xl mb-4">Seus Insights com IA</h2>
              {isLoadingInsights ? <p>Analisando seus padrões...</p> : <p className="text-gray-600 dark:text-gray-300 italic">"{insights}"</p>}
          </Card>
      </div>

      {weeklyChallenge && (
        <Card>
            <h2 className="font-bold text-xl mb-2">Desafio da Semana</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{weeklyChallenge.description}</p>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm font-semibold">{weeklyChallenge.progress} / {weeklyChallenge.target}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs flex items-center justify-center" style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}>
                 <span>{Math.round((weeklyChallenge.progress / weeklyChallenge.target) * 100)}%</span>
              </div>
            </div>
            {weeklyChallenge.isCompleted && <p className="text-green-600 dark:text-green-400 font-semibold text-center mt-3">Desafio Concluído! 🎉</p>}
        </Card>
      )}

      <Card>
          <h2 className="font-bold text-xl mb-4">Minhas Conquistas</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {badges.map(badge => (
                    <div key={badge.id} className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/50">
                        <TrophyIcon className="w-12 h-12 mx-auto text-yellow-500"/>
                        <p className="text-sm font-semibold mt-2">{badge.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(badge.dateEarned).toLocaleDateString('pt-BR')}</p>
                    </div>
                ))}
            </div>
          ) : (
             <p className="text-center text-gray-500 dark:text-gray-400">Complete desafios para ganhar badges!</p>
          )}

      </Card>
    </div>
  );
};

export default Wellbeing;
