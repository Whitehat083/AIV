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
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category?: string;
}

export interface Habit {
  id: string;
  title: string;
  completed: number;
  goal: number;
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
  id: string;
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
  transactions: Transaction[];
  goals: Goal[];
  healthData: HealthData;
  isDarkMode: boolean;
  setActivePage: (page: Page) => void;
  toggleDarkMode: () => void;
  // Data manipulation functions
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  updateHabit: (habitId: string, completed: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateHealthData: (data: Partial<HealthData>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentProgress'>) => void;
  updateGoal: (goalId: string, progress: Partial<Pick<Goal, 'currentProgress'>>) => void;
  deleteGoal: (goalId: string) => void;
}