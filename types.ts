export enum Page {
  Dashboard = 'Dashboard',
  Agenda = 'Agenda',
  Tasks = 'Tarefas & Hábitos',
  Health = 'Saúde',
  Finances = 'Finanças',
  Goals = 'Metas',
  Settings = 'Configurações',
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
}