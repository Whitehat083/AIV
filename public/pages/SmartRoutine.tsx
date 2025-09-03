import React, { useState, useCallback } from 'react';
import { PageProps, RoutinePreferences, RoutineItem } from '../types';
import Card from '../../components/Card';
import { generateSmartRoutine, resolveRoutineConflicts, ResolvedRoutineItem } from '../services/geminiService';
import RoutineConfirmationModal from '../../components/RoutineConfirmationModal';
import { getTodayDateString } from '../utils/dateUtils';
import { UsageLimitError } from '../utils/errors';
import AiUsageIndicator from '../../components/AiUsageIndicator';

const SMART_ROUTINE_LIMIT = 2;

const SmartRoutine: React.FC<PageProps> = (props) => {
    const { 
        user,
        smartRoutine, 
        updateSmartRoutine,
        appointments,
        tasks,
        habits,
        goals,
        moodLogs,
        syncRoutineToAgenda,
        runAi,
        smartRoutineUses
    } = props;

    const [preferences, setPreferences] = useState<RoutinePreferences>(smartRoutine.preferences);
    const [isLoading, setIsLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [resolvedRoutine, setResolvedRoutine] = useState<ResolvedRoutineItem[]>([]);

    const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreferences({ ...preferences, [e.target.name]: e.target.value });
    };
    
    const handlePrioritiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const priorities = e.target.value.split(',').map(p => p.trim()).filter(Boolean);
        setPreferences({ ...preferences, priorities });
    };

    const handleSavePreferences = () => {
        updateSmartRoutine({ preferences });
        alert("Preferências salvas!");
    };

    const handleGenerateRoutine = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await runAi(async () => {
                const latestMood = moodLogs.length > 0 ? moodLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
                const pendingTasks = tasks.filter(t => !t.completed);
                
                const today = new Date();
                const todayAppointments = appointments.filter(a => new Date(a.date).toDateString() === today.toDateString());
                
                const newRoutine = await generateSmartRoutine(preferences, todayAppointments, pendingTasks, habits, goals, latestMood);
                updateSmartRoutine({ routine: newRoutine });
            }, 'smartRoutine');
        } catch (err) {
            if (err instanceof UsageLimitError) {
                // The hook already opens the modal
                return;
            }
            console.error("Failed to generate routine:", err);
            setError("Não foi possível gerar a rotina. A IA pode estar sobrecarregada. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [preferences, appointments, tasks, habits, goals, moodLogs, updateSmartRoutine, runAi]);
    
    const handleClearRoutine = () => {
        updateSmartRoutine({ routine: [] });
    };

    const handleAddToAgendaClick = async () => {
        setIsSyncing(true);
        setError(null);
        try {
            await runAi(async () => {
                const today = new Date();
                const todayStr = getTodayDateString(today);
                const todayAppointments = appointments.filter(a => getTodayDateString(new Date(a.date)) === todayStr);

                const resolved = await resolveRoutineConflicts(smartRoutine.routine, todayAppointments);
                setResolvedRoutine(resolved);
                setIsConfirmModalOpen(true);
            }, 'smartRoutine');
        } catch (err) {
             if (err instanceof UsageLimitError) return;
             setError("Não foi possível verificar os conflitos da agenda. Por favor, tente novamente.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleConfirmSync = (routineToSync: ResolvedRoutineItem[]) => {
        const todayStr = getTodayDateString(new Date());
        const appointmentsToSync = routineToSync.map(item => {
            const [hours, minutes] = item.time.split(':');
            const itemDate = new Date();
            itemDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            
            return {
                title: item.title,
                date: itemDate.toISOString(),
                duration: item.duration,
                icon: item.icon,
            };
        });
        syncRoutineToAgenda(appointmentsToSync, todayStr);
        setIsConfirmModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rotina Inteligente</h1>
                <p className="text-gray-500 dark:text-gray-400">Deixe nossa IA planejar o dia perfeito para sua produtividade e bem-estar.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Gerar Planejamento</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Com base em seus compromissos, tarefas, metas e preferências, a IA criará uma rotina otimizada para hoje. Certifique-se de que suas preferências abaixo estão corretas.</p>
                        
                        {user.plan === 'free' && (
                            <div className="mb-4">
                                <AiUsageIndicator uses={smartRoutineUses} limit={SMART_ROUTINE_LIMIT} featureName="Gerações de Rotina" />
                            </div>
                        )}

                        <button 
                            onClick={handleGenerateRoutine} 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                             {isLoading ? (
                                <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analisando seu dia...
                                </>
                            ) : "Gerar Planejamento do Dia"}
                        </button>
                         {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
                    </Card>
                </div>
                <div>
                     <Card>
                        <h2 className="text-xl font-bold mb-4">Preferências</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium">Início do dia</label>
                                    <input type="time" name="startTime" id="startTime" value={preferences.startTime} onChange={handlePreferencesChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                                </div>
                                 <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium">Fim do dia</label>
                                    <input type="time" name="endTime" id="endTime" value={preferences.endTime} onChange={handlePreferencesChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="priorities" className="block text-sm font-medium">Prioridades do dia</label>
                                <input type="text" name="priorities" id="priorities" placeholder="Trabalho, Estudo, Saúde" value={preferences.priorities.join(', ')} onChange={handlePrioritiesChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                <p className="text-xs text-gray-400 mt-1">Separe por vírgulas.</p>
                            </div>
                             <button onClick={handleSavePreferences} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                                Salvar Preferências
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
            
            {smartRoutine.routine.length > 0 && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Sua Rotina Sugerida</h2>
                        <div className="flex gap-4">
                             <button onClick={handleGenerateRoutine} disabled={isLoading} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Gerar Novamente</button>
                             <button onClick={handleClearRoutine} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">Limpar</button>
                        </div>
                    </div>
                   <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4 pl-6 space-y-8 relative">
                    {smartRoutine.routine.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[34px] top-1.5 h-4 w-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                            <p className="font-bold text-gray-500 dark:text-gray-400">{item.time}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                    <p className="text-sm text-gray-500">{item.duration} minutos - {item.type}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                   </div>
                   <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={handleAddToAgendaClick}
                            disabled={isSyncing}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isSyncing ? 'Verificando agenda...' : 'Adicionar Rotina à Agenda'}
                        </button>
                   </div>
                </Card>
            )}

            <RoutineConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSync}
                routine={resolvedRoutine}
            />

        </div>
    );
};

export default SmartRoutine;