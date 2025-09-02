
import React, { useState, useEffect, useMemo } from 'react';
import { PageProps, RoutineItem } from '../types';
import Card from '../components/Card';
import { generateAgendaSuggestions, AiAgendaResponse } from '../services/geminiService';
import { getTodayDateString } from '../utils/dateUtils';

type ViewMode = 'day' | 'week' | 'month';

interface ScheduleItem extends RoutineItem {
  id: string;
  date: Date;
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
  const { appointments, tasks, habits, goals } = props;
  const [view, setView] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [aiData, setAiData] = useState<AiAgendaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAiSuggestions = async () => {
        setIsLoading(true);
        try {
            const todayStr = getTodayDateString(currentDate);
            const dailyAppointments = appointments.filter(a => getTodayDateString(new Date(a.date)) === todayStr);
            const pendingTasks = tasks.filter(t => !t.completed);
            const dailyHabits = habits.filter(h => h.frequency === 'daily');

            const suggestions = await generateAgendaSuggestions(dailyAppointments, pendingTasks, dailyHabits, goals);
            setAiData(suggestions);
        } catch (error) {
            console.error("Failed to fetch AI suggestions for agenda", error);
        } finally {
            setIsLoading(false);
        }
    };
    if (view === 'day') {
      fetchAiSuggestions();
    }
  }, [currentDate, appointments, tasks, habits, goals, view]);

  const allItemsForDay = useMemo((): ScheduleItem[] => {
    const todayStr = getTodayDateString(currentDate);
    
    const mappedAppointments = appointments
        .filter(a => getTodayDateString(new Date(a.date)) === todayStr)
        .map(a => {
            const itemType = a.isTask ? 'task' : a.isReminder ? 'reminder' : 'appointment';
            return {
                id: a.id,
                title: a.title,
                date: new Date(a.date),
                time: new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                duration: a.duration,
                type: itemType as RoutineItem['type'],
                icon: typeInfo[itemType].icon,
            }
        });

    const aiSchedule = aiData?.schedule.map((item, index) => {
        const [hours, minutes] = item.time.split(':');
        const itemDate = new Date(currentDate);
        itemDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return {
            ...item,
            id: `ai-${index}-${item.time}`,
            date: itemDate,
        }
    }) || [];

    return [...mappedAppointments, ...aiSchedule].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [appointments, aiData, currentDate]);

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
                        const info = typeInfo[item.type] || typeInfo.default;
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
                                <p className="font-bold text-sm truncate leading-tight">{item.icon} {item.title}</p>
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
               <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Hoje</button>
          </div>
          {view === 'day' && <div className="h-[600px] overflow-y-auto pr-4 pb-4 pl-2 rounded-b-xl"><DayView /></div>}
      </Card>
      
      {view === 'week' && <Card><div className="text-center p-10"><h3 className="font-semibold">Visão Semanal em breve!</h3></div></Card>}
      {view === 'month' && <Card><div className="text-center p-10"><h3 className="font-semibold">Visão Mensal em breve!</h3></div></Card>}
        
      {view === 'day' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">Sugestão da IA</h3>
              </div>
              {isLoading ? <div className="h-10 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div> : <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{aiData?.proactiveSuggestion.text}"</p>}
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
    </div>
  );
};

export default Agenda;
