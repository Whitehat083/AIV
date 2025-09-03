export enum Page {
  Dashboard = 'Dashboard',
  Agenda = 'Agenda',
  Tasks = 'Tarefas & Hábitos',
  Health = 'Saúde',
  Finances = 'Finanças',
  Goals = 'Metas',
  Wellbeing = 'Bem-Estar',
  Motivation = 'Motivação',
  Settings = 'Configurações',
  SmartRoutine = 'Rotina Inteligente',
}

export type AiFeature = 'smartRoutine' | 'agenda' | 'wellbeing' | 'quote' | 'challenge';

export interface Recurrence {
  days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
  exceptionDates: string[]; // YYYY-MM-DD
}

export interface FixedAppointment {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location?: string;
  recurrence: Recurrence;
}


export interface Appointment {
  id: string;
  title: string;
  date: string;
  duration: number; // in minutes
  location?: string;
  description?: string;
  isReminder?: boolean; // Flag for goal reminders
  isTask?: boolean; // Flag for tasks on agenda
  isTravel?: boolean; // Flag for travel time
  isAiGenerated?: boolean; // Flag for items from Smart Routine
  icon?: string; // Icon from Smart Routine
  isFixed?: boolean; // Flag for fixed/recurring appointments
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  frequency: 'daily' | 'weekly';
  type: 'quantitative' | 'conclusive';
  // Optional for conclusive habits
  progressUnit?: 'Tempo (min)' | 'Quantidade' | 'Livre';
  dailyGoal?: number; 
}

export interface HabitLog {
    habitId: string;
    date: string; // YYYY-MM-DD
    progress: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface Goal {
  id:string;
  name: string;
  category: string;
  description?: string;
  progressUnit: 'Tempo (horas)' | 'Dinheiro (R$)' | 'Distância (km)' | 'Quantidade' | 'Livre';
  targetValue: number;
  currentProgress: number;
  deadline?: string;
}

export interface HealthData {
  steps: number;
  sleep: number; // in hours
  water: number; // in liters
}

export interface User {
  name: string;
  dob: string;
  plan: 'free' | 'premium';
  smartRoutineUses: number;
}

export type Mood = 'happy' | 'neutral' | 'sad' | 'tired' | 'stressed';

export interface MoodLog {
    date: string; // YYYY-MM-DD
    mood: Mood;
    notes?: string;
}

export interface WeeklyChallenge {
    id: string;
    habitId: string;
    description: string;
    target: number;
    progress: number;
    startDate: string; // YYYY-MM-DD
    isCompleted: boolean;
}

export interface Badge {
    id: string;
    challengeId: string;
    name: string;
    dateEarned: string; // ISO String
}

export interface OnboardingTourProps {
  user: User;
  onComplete: () => void;
}

export interface RoutinePreferences {
  startTime: string; // e.g., "08:00"
  endTime: string;   // e.g., "22:00"
  priorities: string[]; // e.g., ["Trabalho", "Saúde", "Estudos"]
}

export interface RoutineItem {
  time: string; // e.g., "09:00"
  title: string;
  duration: number; // in minutes
  type: 'appointment' | 'task' | 'habit' | 'break' | 'goal' | 'focus';
  icon: string; // emoji or identifier for an icon
}

export interface PageProps {
  user: User;
  appointments: Appointment[];
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  transactions: Transaction[];
  goals: Goal[];
  healthData: HealthData;
  moodLogs: MoodLog[];
  weeklyChallenge: WeeklyChallenge | null;
  badges: Badge[];
  motivationalQuote: string;
  isDarkMode: boolean;
  setActivePage: (page: Page) => void;
  toggleDarkMode: () => void;
  // Data manipulation functions
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  logHabitProgress: (habitId: string, progress: number, date: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  updateHealthData: (data: Partial<HealthData>) => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'currentProgress'>) => void;
  updateGoal: (goalId: string, progress: Partial<Pick<Goal, 'currentProgress'>>) => void;
  deleteGoal: (goalId: string) => void;

  addMoodLog: (mood: Mood, notes?: string) => void;

  // Smart Routine
  smartRoutine: {
    preferences: RoutinePreferences;
    routine: RoutineItem[];
  };
  updateSmartRoutine: (data: Partial<{ preferences: RoutinePreferences; routine: RoutineItem[] }>) => void;
  syncRoutineToAgenda: (routineItems: Omit<Appointment, 'id' | 'isAiGenerated'>[], routineDate: string) => void;

  // Fixed Appointments
  fixedAppointments: FixedAppointment[];
  addFixedAppointment: (appointment: Omit<FixedAppointment, 'id'>) => void;
  updateFixedAppointment: (appointment: FixedAppointment) => void;
  deleteFixedAppointment: (appointmentId: string) => void;

  // Premium Features
  runAi: <T>(aiCallback: () => Promise<T>, feature: AiFeature) => Promise<T | void>;
  smartRoutineUses: number;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  openUpgradeModal: () => void;
}