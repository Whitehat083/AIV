import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageProps, RoutineItem, Appointment, FixedAppointment } from '../types';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { generateAgendaSuggestions, AiAgendaResponse, getAppointmentSuggestions, AiAppointmentSuggestion } from '../services/geminiService';
import { getTodayDateString, generateAppointmentsFromFixed } from '../utils/dateUtils';
import { useDebounce } from '../hooks/useDebounce';
import { UsageLimitError } from '../utils/errors';

type ViewMode = 'day' | 'week' | 'month';

// Fix: Removed `icon?: string` which was incorrectly overriding the required `icon: string` from `RoutineItem`.
// `ScheduleItem` now correctly inherits `icon: string`.
interface ScheduleItem extends RoutineItem {
  id: string;
  date: Date;
  isFixed?: boolean;
}

interface LayoutItem extends ScheduleItem {
  top: number;
  height: number;
  width: number;
  left: number;
}

const typeInfo: { [key: string]: { classes: string; icon: string; name: string } } = {
  appointment: { classes: 'bg-blue-50 dark:bg-blue-900/50 border-blue-500 text-blue-800 dark:text-blue-200', icon: '🗓️', name: 'Compromisso' },
  task: { classes: 'bg-purple-50 dark:bg-purple-900/50 border-purple-500 text-purple-800 dark:text-purple-200', icon: '✅', name: 'Tarefa' },
  habit: { classes: 'bg-green-50 dark:bg-green-900/50 border-green-500 text-green-800 dark:text-green-200', icon: '🔄', name: 'Hábito' },
  goal: { classes: 'bg-purple-50 dark:bg-purple-900/50 border-purple-500 text-purple-800 dark:text-purple-200', icon: '🎯', name: 'Meta' },
  break: { classes: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-500 text-yellow-800 dark:text-yellow-200', icon: '☕', name: 'Pausa' },
  focus: { classes: 'bg-orange-50 dark:bg-orange-900/50 border-orange-500 text-orange-800 dark:text-orange-200', icon: '🧠', name: 'Foco' },
  reminder: { classes: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-500 text-yellow-800 dark:text-yellow-200', icon: '🔔', name: 'Lembrete' },
  travel: { classes: 'bg-gray-100 dark:bg-gray-800/50 border-gray-400 text-gray-600 dark:text-gray-300', icon: '🚗', name: 'Deslocamento' },
  fixed: { classes: 'bg-gray-200 dark:bg-gray-800 border-gray-500 text-gray-800 dark:text-gray-200', icon: '🔒', name: 'Fixo'},
  default: { classes: 'bg-gray-50 dark:bg-gray-800/50 border-gray-400 text-gray-700 dark:text-gray-300', icon: '📌', name: 'Evento' },
};


const processEventsForLayout = (items: ScheduleItem[]): LayoutItem[] => {
    if (!items || items.length === 0) return [];

    const sortedItems = [...items].sort((a, b) => a.date.getTime() - b.date.getTime());

    const groups: ScheduleItem[][] = [];
    sortedItems.forEach(item => {
        let placed = false;
        for (const group of groups) {
            const lastItemInGroup = group[group.length - 1];
            const groupEndTime = lastItemInGroup.date.getTime() + lastItemInGroup.duration * 60000;
            if (item.date.getTime() < groupEndTime) {
                group.push(item);
                placed = true;
                break;
            }
        }
        if (!placed) {
            groups.push([item]);
        }
    });

    return groups.flatMap(group => {
        const columns: ScheduleItem[][] = [];
        group.forEach(item => {
            let placed = false;
            for (const col of columns) {
                const lastInCol = col[col.length - 1];
                if (lastInCol.date.getTime() + lastInCol.duration * 60000 <= item.date.getTime()) {
                    col.push(item);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                columns.push([item]);
            }
        });

        const numColumns = columns.length;
        return columns.flatMap((col, colIndex) => 
            col.map(item => ({
                ...item,
                top: (item.date.getHours() - 7) * 60 + item.date.getMinutes(),
                height: item.duration,
                width: 100 / numColumns,
                left: (100 / numColumns) * colIndex,
            }))
        );
    });
};


const Agenda: React.FC<PageProps> = (props) => {
  const { user, appointments, tasks, habits, goals, addAppointment, fixedAppointments, runAi, openUpgradeModal } = props;
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [aiData, setAiData] = useState<AiAgendaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // New Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Omit<Appointment, 'id'>>>({ title: '', date: '', duration: 30, location: '' });
  const [aiSuggestions, setAiSuggestions] = useState<AiAppointmentSuggestion>({});
  const [isAiLoading, setIsAiLoading] = useState(false);
  const debouncedAppointment = useDebounce(newAppointment, 500);

  const dailyAppointments = useMemo(() => {
    const regular = appointments.filter(a => getTodayDateString(new Date(a.date)) === getTodayDateString(currentDate));
    const fixed = generateAppointmentsFromFixed(fixedAppointments, currentDate);
    return [...regular, ...fixed];
  }, [currentDate, appointments, fixedAppointments]);


  useEffect(() => {
    const fetchAiSuggestions = async () => {
        setIsLoading(true);
        try {
            await runAi(async () => {
              const pendingTasks = tasks.filter(t => !t.completed);
              const dailyHabits = habits.filter(h => h.frequency === 'daily');
              const suggestions = await generateAgendaSuggestions(dailyAppointments, pendingTasks, dailyHabits, goals);
              setAiData(suggestions);
            }, 'agenda');
        } catch (error) {
            if(error instanceof UsageLimitError) return;
            console.error("Failed to fetch AI suggestions for agenda", error);
        } finally {
            setIsLoading(false);
        }
    };
    if (view === 'day' && user.plan === 'premium') {
      fetchAiSuggestions();
    }
  }, [currentDate, dailyAppointments, tasks, habits, goals, view, runAi, user.plan]);
  
  // Effect for new appointment contextual AI
  useEffect(() => {
    const getContextualSuggestions = async () => {
        if (!isModalOpen || user.plan !== 'premium') return;
        setIsAiLoading(true);
        
        try {
          await runAi(async () => {
            const suggestions = await getAppointmentSuggestions(
                debouncedAppointment,
                dailyAppointments,
                habits,
                tasks
            );
            setAiSuggestions(prev => ({...prev, ...suggestions}));

            if(suggestions.optimalTimeSuggestion) {
                setAiSuggestions(current => ({...current, optimalTimeSuggestion: suggestions.optimalTimeSuggestion}))
            } else {
                setAiSuggestions(current => ({
                    optimalTimeSuggestion: current.optimalTimeSuggestion,
                    conflict: suggestions.conflict,
                    travelInfo: suggestions.travelInfo
                }))
            }
          }, 'agenda');
        } catch (error) {
           if(error instanceof UsageLimitError) return;
           console.error("Failed to get contextual suggestions", error);
        } finally {
          setIsAiLoading(false);
        }
    };

    getContextualSuggestions();
  }, [debouncedAppointment, isModalOpen, dailyAppointments, habits, tasks, runAi, user.plan]);

  const handleOpenModal = () => {
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);
    defaultDate.setMinutes(0);
    defaultDate.setSeconds(0);
    setNewAppointment({ title: '', date: defaultDate.toISOString().slice(0, 16), duration: 30, location: '' });
    setAiSuggestions({});
    setIsModalOpen(true);
  }

  const handleSaveAppointment = () => {
    if (!newAppointment.title || !newAppointment.date || !newAppointment.duration) {
        alert("Por favor, preencha o título, data e duração.");
        return;
    }
    
    // Add travel event if applicable
    if (newAppointment.location && aiSuggestions.travelInfo?.travelTime) {
        const mainDate = new Date(newAppointment.date);
        const travelStartDate = new Date(mainDate.getTime() - aiSuggestions.travelInfo.travelTime * 60000);
        addAppointment({
            title: `Deslocamento para ${newAppointment.title}`,
            date: travelStartDate.toISOString(),
            duration: aiSuggestions.travelInfo.travelTime,
            isTravel: true,
        });
    }

    addAppointment({
        title: newAppointment.title,
        date: newAppointment.date,
        duration: newAppointment.duration,
        location: newAppointment.location,
        description: newAppointment.description,
    });
    
    setIsModalOpen(false);
  };

  const allItemsForDay = useMemo((): ScheduleItem[] => {
    const mappedAppointments = dailyAppointments
        .map(a => {
            let itemType: RoutineItem['type'] = a.isFixed ? 'appointment' : 'appointment'; // Default to appointment
             if (a.isFixed) itemType = 'focus'; // Simplified for typing
            if (a.isTravel) itemType = 'break'; // Simplified for typing
            if (a.isTask) itemType = 'task';
            if (a.isReminder) itemType = 'habit'; // Simplified
            if (a.isAiGenerated) {
                // Heuristic to guess type from title if not explicitly stored
                const titleLower = a.title.toLowerCase();
                if (titleLower.includes('pausa') || titleLower.includes('break')) itemType = 'break';
                else if (titleLower.includes('hábito')) itemType = 'habit';
                else if (titleLower.includes('meta')) itemType = 'goal';
                else if (titleLower.includes('foco')) itemType = 'focus';
            }

            return {
                id: a.id,
                title: a.title,
                date: new Date(a.date),
                time: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                duration: a.duration,
                type: itemType,
                isFixed: a.isFixed,
                // Fix: Ensure icon is always a string by providing a fallback to the default icon.
                icon: a.icon || (typeInfo[itemType] || typeInfo.default).icon,
            }
        });

    const aiSchedule = (user.plan === 'premium' && aiData?.schedule.map((item, index) => {
        const [hours, minutes] = item.time.split(':');
        const itemDate = new Date(currentDate);
        itemDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return {
            ...item,
            id: `ai-${index}-${item.time}`,
            date: itemDate,
        }
    })) || [];

    return [...mappedAppointments, ...aiSchedule].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [dailyAppointments, aiData, currentDate, user.plan]);

  const handleDateChange = (amount: number) => {
      setCurrentDate(prev => {
          const newDate = new Date(prev);
          if (view === 'day') newDate.setDate(newDate.getDate() + amount);
          if (view === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
          if (view === 'month') newDate.setMonth(newDate.getMonth() + amount);
          return newDate;
      });
  };
  
  const getHeaderTitle = () => {
    if(view === 'day') return currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
    if(view === 'week') {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${endOfWeek.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}`;
    }
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  const DayView = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const processedEvents = useMemo(() => processEventsForLayout(allItemsForDay), [allItemsForDay]);
    
    const minutesSinceStart = (currentTime.getHours() - 7) * 60 + currentTime.getMinutes();
    const showTimeIndicator = getTodayDateString(currentDate) === getTodayDateString(new Date()) && currentTime.getHours() >= 7 && currentTime.getHours() < 23;

    const hours = Array.from({ length: 16 }, (_, i) => i + 7);

    return (
        <div className="grid grid-cols-[auto,1fr] gap-x-3">
            {/* Time labels column */}
            <div className="flex flex-col">
                {hours.map(hour => (
                    <div key={`time-${hour}`} className="h-[60px] text-right text-xs text-gray-400 dark:text-gray-500 pr-2 -mt-2">
                        {`${hour.toString().padStart(2, '0')}:00`}
                    </div>
                ))}
            </div>

            {/* Main timeline column */}
            <div className="relative">
                {/* Background grid lines */}
                <div className="absolute inset-0">
                    {hours.map((hour) => (
                        <div key={`line-${hour}`} className="h-[60px] border-t border-gray-200 dark:border-gray-700/50"></div>
                    ))}
                </div>

                {/* Absolutely positioned events and time indicator */}
                <div className="absolute inset-y-0 left-0 right-0">
                    {showTimeIndicator && (
                        <div className="absolute w-full z-10" style={{ top: `${minutesSinceStart}px` }}>
                            <div className="relative">
                                <div className="h-0.5 bg-red-500 w-full"></div>
                                <div className="absolute -left-1.5 -top-1 w-3 h-3 bg-red-500 rounded-full shadow"></div>
                            </div>
                        </div>
                    )}
                    {processedEvents.map(item => {
                        const info = item.isFixed ? typeInfo.fixed : typeInfo[item.type] || typeInfo.default;
                        const icon = item.isFixed ? typeInfo.fixed.icon : (item.icon || info.icon);
                        // Prevent event from overflowing the bottom
                        const height = Math.min(item.height, 16 * 60 - item.top);
                        const startTime = item.time;
                        const endTime = new Date(item.date.getTime() + item.duration * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        return (
                            <div 
                                key={item.id} 
                                className={`absolute p-2 rounded-lg border-l-4 shadow-sm hover:shadow-md hover:z-20 transition-all duration-200 overflow-hidden flex flex-col ${info.classes}`} 
                                style={{ 
                                    top: `${item.top}px`, 
                                    height: `${height}px`,
                                    left: `${item.left + 1}%`,
                                    width: `calc(${item.width - 2}%)`,
                                    minHeight: '2rem'
                                }}
                            >
                                <p className="font-bold text-sm truncate leading-tight">{icon} {item.title}</p>
                                {height > 35 && <p className="text-xs opacity-80 mt-1">{startTime} - {endTime}</p>}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};
  

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda Inteligente</h1>
        <p className="text-gray-500 dark:text-gray-400">Sua vida, organizada e otimizada pela IA.</p>
      </header>

       <Card className="!p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  {(['day', 'week', 'month'] as ViewMode[]).map(v => (
                      <button key={v} onClick={() => setView(v)} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${view === v ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                  ))}
              </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">&lt;</button>
                  <h2 className="text-lg font-semibold text-center w-48">{getHeaderTitle()}</h2>
                  <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">&gt;</button>
               </div>
               <button onClick={handleOpenModal} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">+ Novo Compromisso</button>
          </div>
          {view === 'day' && <div className="h-[600px] overflow-y-auto pr-4 pb-4 pl-2 rounded-b-xl"><DayView /></div>}
      </Card>
      
      {view === 'week' && <Card><div className="text-center p-10"><h3 className="font-semibold">Visão Semanal em breve!</h3></div></Card>}
      {view === 'month' && <Card><div className="text-center p-10"><h3 className="font-semibold">Visão Mensal em breve!</h3></div></Card>}
        
      {view === 'day' && user.plan === 'premium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">Sugestão da IA</h3>
              </div>
              {isLoading ? <div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div> : <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{aiData?.proactiveSuggestion.text || 'Gere sugestões para ver insights aqui.'}"</p>}
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                  <span className="text-xl">⭐</span>
                </div>
                <h3 className="font-bold text-lg text-orange-700 dark:text-orange-300">Horários de Ouro</h3>
              </div>
              {isLoading ? <div className="space-y-2"><div className="h-12 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div><div className="h-12 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div></div> :
                <ul className="space-y-2">
                  {aiData?.highlights && aiData.highlights.length > 0 ? aiData.highlights.map((h, i) => (
                    <li key={i} className="text-sm p-3 bg-orange-50 dark:bg-orange-900/50 rounded-lg border border-orange-200 dark:border-orange-800/50">
                      <p className="font-semibold text-orange-800 dark:text-orange-200">{h.startTime} - {h.endTime}</p>
                      <p className="text-orange-700 dark:text-orange-300 text-xs">{h.reason}</p>
                    </li>
                  )) : <p className="text-sm text-gray-500">Nenhum horário de pico identificado hoje.</p>}
                </ul>
              }
          </Card>
        </div>
      )}

      {view === 'day' && user.plan === 'free' && (
        <Card>
            <div className="text-center">
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">✨ Desbloqueie a Agenda Inteligente</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Assinantes Premium recebem sugestões diárias, análise de horários e mais para otimizar o dia.</p>
                <button onClick={openUpgradeModal} className="mt-4 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                    Fazer Upgrade
                </button>
            </div>
        </Card>
      )}
        
        {/* New Appointment Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Compromisso">
             <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                    <input type="text" name="title" id="title" value={newAppointment.title} onChange={e => setNewAppointment(p => ({...p, title: e.target.value}))} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data e Hora</label>
                        <input type="datetime-local" name="date" id="date" value={newAppointment.date?.substring(0, 16)} onChange={e => setNewAppointment(p => ({...p, date: e.target.value}))} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duração (min)</label>
                        <input type="number" name="duration" id="duration" value={newAppointment.duration} onChange={e => setNewAppointment(p => ({...p, duration: parseInt(e.target.value, 10)}))} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local (Opcional)</label>
                    <input type="text" name="location" id="location" value={newAppointment.location} onChange={e => setNewAppointment(p => ({...p, location: e.target.value}))} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Ex: Av. Paulista, 1000"/>
                </div>

                {user.plan === 'premium' && isAiLoading && <div className="text-sm text-gray-500 text-center">IA analisando...</div>}

                {/* AI Suggestions Section */}
                {user.plan === 'premium' && !isAiLoading && (aiSuggestions.optimalTimeSuggestion || aiSuggestions.travelInfo || aiSuggestions.conflict) && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-300">Sugestões da IA</h3>
                      {aiSuggestions.optimalTimeSuggestion && (
                         <div className="flex items-center gap-2">
                             <p className="text-xs flex-1">{aiSuggestions.optimalTimeSuggestion.reason}</p>
                             <button onClick={() => setNewAppointment(p => ({...p, date: aiSuggestions.optimalTimeSuggestion?.time}))} className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200">
                                 Agendar para {new Date(aiSuggestions.optimalTimeSuggestion.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}?
                             </button>
                         </div>
                      )}
                      {aiSuggestions.travelInfo && (
                         <div className="text-xs p-2 bg-blue-50 dark:bg-blue-900/40 rounded-md">🚗 {aiSuggestions.travelInfo.suggestion} A agenda será ajustada.</div>
                      )}
                      {aiSuggestions.conflict && (
                          <div className="text-xs p-2 bg-red-50 dark:bg-red-900/40 rounded-md border-l-2 border-red-500">
                              <p className="font-bold">⚠️ Conflito Detectado!</p>
                              <p>Este horário conflita com: <span className="font-semibold">{aiSuggestions.conflict.conflictsWith}</span>.</p>
                              <p>{aiSuggestions.conflict.resolution}</p>
                          </div>
                      )}
                  </div>
                )}


                <div className="flex justify-end pt-4 gap-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button onClick={handleSaveAppointment} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Salvar Compromisso
                    </button>
                </div>
            </div>
        </Modal>

    </div>
  );
};

export default Agenda;