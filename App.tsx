import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Page, Appointment, Task, Habit, Transaction, Goal, HealthData, User, HabitLog } from './types';
import { PAGE_COMPONENTS, NAV_ITEMS } from './constants';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import OnboardingTour from './pages/OnboardingTour';
import { getTodayDateString } from './utils/dateUtils';

const App: React.FC = () => {
  // Helper to get state from localStorage
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
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

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialState('aiv-appointments', []));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('aiv-tasks', []));
  const [habits, setHabits] = useState<Habit[]>(() => getInitialState('aiv-habits', []));
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() => getInitialState('aiv-habitLogs', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('aiv-transactions', []));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('aiv-goals', []));
  const [healthData, setHealthData] = useState<HealthData>(() => getInitialState('aiv-healthData', { steps: 0, sleep: 0, water: 0 }));

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
  }, [user, isTourCompleted, isDarkMode, appointments, tasks, habits, habitLogs, transactions, goals, healthData]);
  
  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const handleUserRegistration = (userData: User) => {
    setUser(userData);
    // Clear all data to ensure a fresh start for the tour
    setAppointments([]);
    setTasks([]);
    setHabits([]);
    setHabitLogs([]);
    setTransactions([]);
    setGoals([]);
    setHealthData({ steps: 0, sleep: 0, water: 0 });
    setIsTourCompleted(false); // Ensure tour starts after registration
  };

  const handleTourComplete = () => {
    setIsTourCompleted(true);
  };
  
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // CRUD Operations
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    setAppointments(prev => [...prev, newAppointment]);
  };
  
  // --- TASKS ---
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
  
  // --- HABITS ---
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
    if (existingLogIndex > -1) {
        setHabitLogs(logs => logs.map((log, index) => index === existingLogIndex ? { ...log, progress } : log));
    } else {
        setHabitLogs(logs => [...logs, { habitId, date, progress }]);
    }
  };
  
  // --- OTHERS ---
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
        addGoal={addGoal}
        addHabit={addHabit}
        addTask={addTask}
        updateHealthData={updateHealthData}
        addTransaction={addTransaction}
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
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow pb-24">
        <div className="container mx-auto px-4 py-6">
          <ActivePageComponent {...pageProps} />
        </div>
      </main>
      <BottomNav navItems={NAV_ITEMS} activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default App;
