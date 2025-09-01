import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Page, Appointment, Task, Habit, Transaction, Goal, HealthData, User } from './types';
import { PAGE_COMPONENTS, NAV_ITEMS } from './constants';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';

// Initial mock data for new users
const initialAppointments: Appointment[] = [
    { id: '1', title: 'Reunião de equipe', date: new Date().toISOString(), duration: 60, location: 'Online' },
];
const initialTasks: Task[] = [
    { id: '1', title: 'Finalizar relatório', completed: false, priority: 'high' },
    { id: '2', title: 'Enviar e-mails de follow-up', completed: false, priority: 'medium' },
];
const initialHabits: Habit[] = [
    { id: '1', title: 'Beber 2L de água', completed: 0, goal: 5 },
    { id: '2', title: 'Ler 20 páginas', completed: 0, goal: 1 },
];
const initialGoals: Goal[] = [
    { id: '1', name: 'Juntar R$5.000 para viagem', category: 'Financeiro', progressUnit: 'Dinheiro (R$)', targetValue: 5000, currentProgress: 1500, deadline: new Date(new Date().getFullYear(), 11, 31).toISOString() },
    { id: '2', name: 'Ler "O Poder do Hábito"', category: 'Leitura', progressUnit: 'Quantidade', targetValue: 1, currentProgress: 0 },
    { id: '3', name: 'Pedalar 30km no mês', category: 'Esportes', progressUnit: 'Distância (km)', targetValue: 30, currentProgress: 12 },
];


const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.Dashboard);

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
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => getInitialState('aiv-isOnboarded', false));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getInitialState('aiv-isDarkMode', false));

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>(() => getInitialState('aiv-appointments', []));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('aiv-tasks', []));
  const [habits, setHabits] = useState<Habit[]>(() => getInitialState('aiv-habits', []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState('aiv-transactions', []));
  const [goals, setGoals] = useState<Goal[]>(() => getInitialState('aiv-goals', []));
  const [healthData, setHealthData] = useState<HealthData>(() => getInitialState('aiv-healthData', { steps: 0, sleep: 0, water: 0 }));

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('aiv-user', JSON.stringify(user));
    localStorage.setItem('aiv-isOnboarded', JSON.stringify(isOnboarded));
    localStorage.setItem('aiv-isDarkMode', JSON.stringify(isDarkMode));
    localStorage.setItem('aiv-appointments', JSON.stringify(appointments));
    localStorage.setItem('aiv-tasks', JSON.stringify(tasks));
    localStorage.setItem('aiv-habits', JSON.stringify(habits));
    localStorage.setItem('aiv-transactions', JSON.stringify(transactions));
    localStorage.setItem('aiv-goals', JSON.stringify(goals));
    localStorage.setItem('aiv-healthData', JSON.stringify(healthData));
  }, [user, isOnboarded, isDarkMode, appointments, tasks, habits, transactions, goals, healthData]);
  
  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const handleOnboardingComplete = (userData: User) => {
    setUser(userData);
    // Give user some initial data to see how the app works
    setAppointments(initialAppointments);
    setTasks(initialTasks);
    setHabits(initialHabits);
    setGoals(initialGoals);
    setIsOnboarded(true);
  };
  
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // CRUD Operations
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: crypto.randomUUID() };
    setAppointments(prev => [...prev, newAppointment]);
  };
  
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask = { ...task, id: crypto.randomUUID(), completed: false };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };
  
  const updateHabit = (habitId: string, completed: number) => {
    setHabits(habits.map(h => h.id === habitId ? { ...h, completed: Math.max(0, completed) } : h));
  };
  
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
  const goalReminders = useMemo(() => {
    return goals
      .filter(g => g.currentProgress < g.targetValue) // only ongoing goals
      .map(g => {
        const reminderDate = new Date();
        reminderDate.setHours(9, 0, 0, 0); // Reminder at 9 AM today
        return {
          id: `goal-reminder-${g.id}`,
          title: `Lembre-se da sua meta: ${g.name}`,
          date: reminderDate.toISOString(),
          duration: 0, // It's just a reminder
          isReminder: true,
        } as Appointment;
      });
  }, [goals]);

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const ActivePageComponent = PAGE_COMPONENTS[activePage];
  const pageProps = {
    user: user!,
    appointments: [...appointments, ...goalReminders],
    tasks,
    habits,
    transactions,
    goals,
    healthData,
    isDarkMode,
    setActivePage,
    toggleDarkMode,
    addAppointment,
    addTask,
    toggleTask,
    updateHabit,
    addTransaction,
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