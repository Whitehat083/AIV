import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Page, Appointment, Task, Habit, Transaction, Goal, HealthData, User, HabitLog, MoodLog, WeeklyChallenge, Badge, Mood, RoutinePreferences, RoutineItem, FixedAppointment } from './types';
import { PAGE_COMPONENTS, NAV_ITEMS } from './constants';
import BottomNav from '../components/BottomNav';
import Onboarding from './pages/Onboarding';
import OnboardingTour from './pages/OnboardingTour';
import MoodCheckinModal from '../components/MoodCheckinModal';
import UpgradeModal from '../components/UpgradeModal';
import { getTodayDateString } from './utils/dateUtils';
import { generateMotivationalQuote, generateWeeklyChallenge } from './services/geminiService';
import { useAi } from './hooks/useAi';
import { UsageLimitError } from './utils/errors';

const App: React.FC = () => {
  // Helper to get state from localStorage
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Migration for existing users
        if (key === 'aiv-user' && parsed) {
            if (parsed.aiUses || !('smartRoutineUses' in parsed)) {
                 return {
                    ...parsed,
                    plan: parsed.plan || 'free',
                    smartRoutineUses: 0, // Reset for all users on migration
                    aiUses: undefined,
                } as unknown as T;
            }
        }
        return parsed;
      }
      return defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  };

  // App State
  const [user, setUser] = useState<User | null>(() => getInitialState('aiv-user', null));
  const [isTourCompleted, setIsTourCompleted] = useState<boolean>(() => getInitialState('aiv-isTourCompleted', false));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getInitialState('aiv-isDarkMode', false));
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);
  const [showMoodCheckin, setShowMoodCheckin] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);


  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialState('aiv-appointments', []));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('aiv-tasks', []));
  const [habits, setHabits] = useState<Habit[]>(() => getInitialState('aiv-habits', []));
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => getInitialState('aiv-habitLogs', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('aiv-transactions', []));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('aiv-goals', []));
  const [healthData, setHealthData] = useState<HealthData>(() => getInitialState('aiv-healthData', { steps: 0, sleep: 0, water: 0 }));
  
  // Wellbeing Module State
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => getInitialState('aiv-moodLogs', []));
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(() => getInitialState('aiv-weeklyChallenge', null));
  const [badges, setBadges] = useState<Badge[]>(() => getInitialState('aiv-badges', []));
  const [motivationalQuote, setMotivationalQuote] = useState<{ quote: string, date: string }>(() => getInitialState('aiv-quote', { quote: 'Vamos fazer de hoje um ótimo dia!', date: '' }));

  // Smart Routine State
  const [smartRoutine, setSmartRoutine] = useState<{ preferences: RoutinePreferences; routine: RoutineItem[] }>(() => 
    getInitialState('aiv-smartRoutine', { 
      preferences: { startTime: '08:00', endTime: '22:00', priorities: ['Trabalho', 'Saúde', 'Estudos'] }, 
      routine: [] 
    })
  );
  
  // Fixed Appointments State
  const [fixedAppointments, setFixedAppointments] = useState<FixedAppointment[]>(() => getInitialState('aiv-fixedAppointments', []));

  // AI Usage Hook
  const { runAi, smartRoutineUses } = useAi(user, setUser, () => setIsUpgradeModalOpen(true));

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('aiv-user', JSON.stringify(user));
    localStorage.setItem('aiv-isTourCompleted', JSON.stringify(isTourCompleted));
    localStorage.setItem('aiv-isDarkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('aiv-appointments', JSON.stringify(appointments));
    localStorage.setItem('aiv-tasks', JSON.stringify(tasks));
    localStorage.setItem('aiv-habits', JSON.stringify(habits));
    localStorage.setItem('aiv-habitLogs', JSON.stringify(habitLogs));
    localStorage.setItem('aiv-transactions', JSON.stringify(transactions));
    localStorage.setItem('aiv-goals', JSON.stringify(goals));
    localStorage.setItem('aiv-healthData', JSON.stringify(healthData));
    localStorage.setItem('aiv-moodLogs', JSON.stringify(moodLogs));
    localStorage.setItem('aiv-weeklyChallenge', JSON.stringify(weeklyChallenge));
    localStorage.setItem('aiv-badges', JSON.stringify(badges));
    localStorage.setItem('aiv-quote', JSON.stringify(motivationalQuote));
    localStorage.setItem('aiv-smartRoutine', JSON.stringify(smartRoutine));
    localStorage.setItem('aiv-fixedAppointments', JSON.stringify(fixedAppointments));
  }, [user, isTourCompleted, isDarkMode, appointments, tasks, habits, habitLogs, transactions, goals, healthData, moodLogs, weeklyChallenge, badges, motivationalQuote, smartRoutine, fixedAppointments]);
  
  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchAiFeatures = useCallback(async () => {
    if (!user || !isTourCompleted || user.plan !== 'premium') return;

    const todayStr = getTodayDateString(new Date());

    // Check and generate weekly challenge
    const shouldGenerateChallenge = habits.length > 0 && (!weeklyChallenge || (new Date().getDay() === 1 && weeklyChallenge.startDate !== todayStr));
    if (shouldGenerateChallenge) {
      try {
        await runAi(async () => {
            const aiSuggestion = await generateWeeklyChallenge(habits, goals, moodLogs);
            if (aiSuggestion && habits.some(h => h.id === aiSuggestion.habitId)) {
                const newChallenge: WeeklyChallenge = {
                    id: crypto.randomUUID(),
                    habitId: aiSuggestion.habitId,
                    description: aiSuggestion.description,
                    target: aiSuggestion.target,
                    progress: 0,
                    startDate: todayStr,
                    isCompleted: false,
                };
                setWeeklyChallenge(newChallenge);
            } else {
                throw new Error("AI suggestion failed or invalid.");
            }
        }, 'challenge');
      } catch (err) {
          console.error("AI Challenge generation failed, using fallback.", err);
          const randomHabit = habits[Math.floor(Math.random() * habits.length)];
          const newChallenge: WeeklyChallenge = {
              id: crypto.randomUUID(),
              habitId: randomHabit.id,
              description: `Complete o hábito "${randomHabit.name}" 4 vezes esta semana!`,
              target: 4,
              progress: 0,
              startDate: todayStr,
              isCompleted: false,
          };
          setWeeklyChallenge(newChallenge);
      }
    }
    
    // Check and generate daily quote
    if (motivationalQuote.date !== todayStr) {
       try {
          await runAi(async () => {
              const latestMood = moodLogs.length > 0 ? moodLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
              const quote = await generateMotivationalQuote(latestMood, habits, goals, habitLogs);
              setMotivationalQuote({ quote, date: todayStr });
          }, 'quote');
       } catch (err) {
          console.error("Failed to generate quote", err)
       }
    }
  }, [user, isTourCompleted, habits, goals, moodLogs, habitLogs, weeklyChallenge, motivationalQuote.date, runAi]);
  
  useEffect(() => {
    // Show mood check-in once per day regardless of plan
    if (user && isTourCompleted) {
        const todayStr = getTodayDateString(new Date());
        const hasLoggedToday = moodLogs.some(log => log.date === todayStr);
        if (!hasLoggedToday) {
            setShowMoodCheckin(true);
        }
    }
    // Fetch AI features only for premium users
    if (user?.plan === 'premium') {
        fetchAiFeatures();
    }
  }, [user, isTourCompleted, moodLogs, fetchAiFeatures]);


  const handleUserRegistration = (userData: Omit<User, 'plan' | 'smartRoutineUses'>) => {
    setUser({
        ...userData,
        plan: 'free',
        smartRoutineUses: 0,
    });
    // Clear all data to ensure a fresh start for the tour
    setAppointments([]);
    setTasks([]);
    setHabits([]);
    setHabitLogs([]);
    setTransactions([]);
    setGoals([]);
    setHealthData({ steps: 0, sleep: 0, water: 0 });
    setMoodLogs([]);
    setWeeklyChallenge(null);
    setBadges([]);
    setIsTourCompleted(false); // Ensure tour starts after registration
  };

  const handleTourComplete = () => {
    setIsTourCompleted(true);
  };
  
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleUpgrade = () => {
    // This would redirect to Stripe in a real app
    alert("Redirecionando para a página de pagamento... (simulação)");
    setUser(prev => prev ? ({ ...prev, plan: 'premium' }) : null);
    setIsUpgradeModalOpen(false);
  }

  // CRUD Operations
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    setAppointments(prev => [...prev, newAppointment]);
  };
  
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask = { ...task, id: crypto.randomUUID(), completed: false };
    setTasks(prev => [newTask, ...prev]);
  };
  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  }
  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t));
  };
  
  const addHabit = (habit: Omit<Habit, 'id'>) => {
      const newHabit = { ...habit, id: crypto.randomUUID() };
      setHabits(prev => [newHabit, ...prev]);
  };
  const updateHabit = (updatedHabit: Habit) => {
      setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };
  const deleteHabit = (habitId: string) => {
      if(confirm('Tem certeza que deseja excluir este hábito? Todo o histórico de progresso será perdido.')){
        setHabits(habits.filter(h => h.id !== habitId));
        setHabitLogs(logs => logs.filter(l => l.habitId !== habitId)); // Also clear logs
      }
  };

  const logHabitProgress = (habitId: string, progress: number, date: string) => {
    const existingLogIndex = habitLogs.findIndex(l => l.habitId === habitId && l.date === date);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const goal = habit.type === 'conclusive' ? 1 : (habit.dailyGoal || 1);
    const wasCompletedBefore = existingLogIndex > -1 ? habitLogs[existingLogIndex].progress >= goal : false;
    const isCompletedNow = progress >= goal;

    if (existingLogIndex > -1) {
        setHabitLogs(logs => logs.map((log, index) => index === existingLogIndex ? { ...log, progress } : log));
    } else {
        setHabitLogs(logs => [...logs, { habitId, date, progress }]);
    }

    // Update weekly challenge if applicable
    if (weeklyChallenge && weeklyChallenge.habitId === habitId && !weeklyChallenge.isCompleted) {
        const completedToday = !wasCompletedBefore && isCompletedNow;
        if (completedToday) {
            const newProgress = weeklyChallenge.progress + 1;
            const isChallengeComplete = newProgress >= weeklyChallenge.target;
            setWeeklyChallenge({ ...weeklyChallenge, progress: newProgress, isCompleted: isChallengeComplete });

            if (isChallengeComplete) {
                const newBadge: Badge = {
                    id: crypto.randomUUID(),
                    challengeId: weeklyChallenge.id,
                    name: `Desafio Semanal: ${habit.name}`,
                    dateEarned: new Date().toISOString(),
                };
                setBadges(prev => [...prev, newBadge]);
            }
        }
    }
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const updateHealthData = (data: Partial<HealthData>) => {
    setHealthData(prev => ({ ...prev, ...data }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentProgress'>) => {
    const newGoal = { ...goal, id: crypto.randomUUID(), currentProgress: 0 };
    setGoals(prev => [...prev, newGoal]);
  };
  
  const updateGoal = (goalId: string, progress: Partial<Pick<Goal, 'currentProgress'>>) => {
      setGoals(goals.map(g => g.id === goalId ? { ...g, ...progress } : g));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
  };
  
  const addMoodLog = (mood: Mood, notes?: string) => {
    const todayStr = getTodayDateString(new Date());
    const newLog: MoodLog = { date: todayStr, mood, notes };
    const existingLogIndex = moodLogs.findIndex(l => l.date === todayStr);
    if (existingLogIndex > -1) {
        setMoodLogs(logs => logs.map((log, index) => index === existingLogIndex ? newLog : log));
    } else {
        setMoodLogs(logs => [...logs, newLog]);
    }
    setShowMoodCheckin(false); // Hide modal after logging
  };

  const updateSmartRoutine = (data: Partial<{ preferences: RoutinePreferences; routine: RoutineItem[] }>) => {
    setSmartRoutine(prev => ({ 
      ...prev, 
      ...data,
      preferences: { ...prev.preferences, ...data.preferences },
    }));
  };

  const syncRoutineToAgenda = (routineItems: Omit<Appointment, 'id' | 'isAiGenerated'>[], routineDate: string) => {
    setAppointments(prev => {
        // Filter out old AI-generated appointments for that specific day to allow overwriting
        const nonRoutineAppointments = prev.filter(app => 
            !(app.isAiGenerated && getTodayDateString(new Date(app.date)) === routineDate)
        );

        // Create new appointments from the routine
        const newRoutineAppointments = routineItems.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            isAiGenerated: true,
        }));

        return [...nonRoutineAppointments, ...newRoutineAppointments];
    });
    alert("Sua rotina foi adicionada à agenda!");
    setActivePage(Page.Agenda);
  };

  // Fixed Appointments CRUD
  const addFixedAppointment = (appointment: Omit<FixedAppointment, 'id'>) => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    setFixedAppointments(prev => [...prev, newAppointment]);
  };
  const updateFixedAppointment = (updatedAppointment: FixedAppointment) => {
    setFixedAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
  };
  const deleteFixedAppointment = (appointmentId: string) => {
    setFixedAppointments(prev => prev.filter(a => a.id !== appointmentId));
  };


  // Create daily reminders for ongoing goals to display on the agenda
  const generatedAppointments = useMemo(() => {
    const reminders = goals
      .filter(g => g.currentProgress < g.targetValue) // only ongoing goals
      .map(g => {
        const reminderDate = new Date();
        reminderDate.setHours(9, 0, 0, 0); // Reminder at 9 AM today
        return {
          id: `goal-reminder-${g.id}`,
          title: `Lembre-se da sua meta: ${g.name}`,
          date: reminderDate.toISOString(),
          duration: 0,
          isReminder: true,
        } as Appointment;
      });

    const tasksOnAgenda = tasks
        .filter(t => t.dueDate && !t.completed)
        .map(t => ({
            id: `task-${t.id}`,
            title: `Tarefa: ${t.title}`,
            date: t.dueDate as string,
            duration: 0,
            isTask: true,
        } as Appointment));

    return [...reminders, ...tasksOnAgenda];
  }, [goals, tasks]);

  if (!user) {
    return <Onboarding onRegister={handleUserRegistration} />;
  }

  if (!isTourCompleted) {
    return (
      <OnboardingTour
        user={user}
        onComplete={handleTourComplete}
      />
    );
  }

  const ActivePageComponent = PAGE_COMPONENTS[activePage];
  const pageProps = {
    user: user!,
    appointments: [...appointments, ...generatedAppointments],
    tasks,
    habits,
    habitLogs,
    transactions,
    goals,
    healthData,
    moodLogs,
    weeklyChallenge,
    badges,
    motivationalQuote: motivationalQuote.quote,
    isDarkMode,
    setActivePage,
    toggleDarkMode,
    // Functions
    addAppointment,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addHabit,
    updateHabit,
    deleteHabit,
    logHabitProgress,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateHealthData,
    addGoal,
    updateGoal,
    deleteGoal,
    addMoodLog,
    smartRoutine,
    updateSmartRoutine,
    syncRoutineToAgenda,
    // Fixed Appointments
    fixedAppointments,
    addFixedAppointment,
    updateFixedAppointment,
    deleteFixedAppointment,
    // Premium features
    runAi,
    smartRoutineUses,
    setUser,
    openUpgradeModal: () => setIsUpgradeModalOpen(true),
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-100">
      {showMoodCheckin && <MoodCheckinModal onSubmit={addMoodLog} onClose={() => setShowMoodCheckin(false)} />}
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleUpgrade} />
      <main className="flex-grow pb-24">
        <div className="container mx-auto px-4 py-6">
          <ActivePageComponent {...pageProps} />
        </div>
      </main>
      <BottomNav user={user} navItems={NAV_ITEMS} activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;