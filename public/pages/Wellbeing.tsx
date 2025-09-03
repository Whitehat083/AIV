import React, { useState, useMemo, useEffect } from 'react';
import { PageProps, Mood, MoodLog } from '../types';
import Card from '../../components/Card';
import { getTodayDateString } from '../utils/dateUtils';
import { getEmotionalInsights } from '../services/geminiService';
import BreathingExercise from '../../components/BreathingExercise';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UsageLimitError } from '../utils/errors';

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

const Wellbeing: React.FC<PageProps> = ({ user, weeklyChallenge, badges, addMoodLog, moodLogs, runAi, openUpgradeModal }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isBreathing, setIsBreathing] = useState<number | null>(null);

  const todayStr = getTodayDateString(new Date());
  const todaysLog = moodLogs.find(log => log.date === todayStr);

  useEffect(() => {
    const fetchInsights = async () => {
      if (moodLogs.length > 2 && !insights) {
        setIsLoadingInsights(true);
        try {
            await runAi(async () => {
                const result = await getEmotionalInsights(moodLogs);
                setInsights(result);
            }, 'wellbeing');
        } catch(error) {
            if (error instanceof UsageLimitError) {
                setInsights("Você atingiu seu limite de IA. Faça upgrade para insights diários.");
            } else {
                 console.error("Error fetching emotional insights:", error);
                 setInsights("Não foi possível carregar os insights no momento.");
            }
        } finally {
            setIsLoadingInsights(false);
        }
      }
    }
    if (user.plan === 'premium') {
        fetchInsights();
    }
  }, [moodLogs, insights, runAi, user.plan]);


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
                          <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }}/>
                          <Line type="monotone" dataKey="valor" name="Humor" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </Card>
           <Card>
                <h2 className="font-bold text-xl mb-4">Insights da IA</h2>
                {isLoadingInsights ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    </div>
                ) : (
                    <p className="text-sm italic text-gray-600 dark:text-gray-300">
                      {user.plan === 'premium' ? `"${insights || 'Continue registrando seu humor para receber insights.'}"` : (
                          <>
                              <span className="font-semibold not-italic">✨ Exclusivo para Premium</span><br/>
                              Receba análises semanais sobre seus padrões de humor e dicas personalizadas para melhorar seu bem-estar.
                              <button onClick={openUpgradeModal} className="mt-3 w-full bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
                                  Fazer Upgrade
                              </button>
                          </>
                      )}
                    </p>
                )}
            </Card>
      </div>

       <Card>
            <h2 className="font-bold text-xl mb-4">Conquistas & Desafios</h2>
            {weeklyChallenge && (
                <div className="mb-4">
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wider">Desafio da Semana</p>
                    <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                        <p className="font-medium text-blue-800 dark:text-blue-200">{weeklyChallenge.description}</p>
                        <div className="w-full bg-blue-200/50 dark:bg-blue-800/50 rounded-full h-2 mt-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
            )}
            <div>
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-300 uppercase tracking-wider">Badges Conquistados</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {badges.length > 0 ? badges.map(badge => (
                        <div key={badge.id} className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full">
                            <TrophyIcon className="w-4 h-4" />
                            <span className="text-xs font-bold">{badge.name}</span>
                        </div>
                    )) : <p className="text-xs text-gray-500">Nenhum badge conquistado ainda.</p>}
                </div>
            </div>
        </Card>

    </div>
  );
};

export default Wellbeing;
