import React, { useState, useMemo } from 'react';
import { PageProps, Task, Habit } from '../types';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { getTodayDateString } from '../utils/dateUtils';

type ActiveTab = 'tasks' | 'habits' | 'stats';

const priorityClasses = {
  high: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  medium: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-green-500 bg-green-50 dark:bg-green-900/20',
};

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);


const TasksAndHabits: React.FC<PageProps> = (props) => {
    const { tasks, habits, habitLogs, addTask, updateTask, deleteTask, toggleTask, addHabit, updateHabit, deleteHabit, logHabitProgress } = props;
    const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
    
    // Task State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Habit State
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [habitFormType, setHabitFormType] = useState<Habit['type']>('quantitative');

    const pendingTasks = useMemo(() => tasks.filter(t => !t.completed).sort((a,b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime()), [tasks]);
    const completedTasks = useMemo(() => tasks.filter(t => t.completed).sort((a,b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()), [tasks]);

    // --- Task Modal Handlers ---
    const openNewTaskModal = () => {
        setEditingTask(null);
        setIsTaskModalOpen(true);
    };
    const openEditTaskModal = (task: Task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };
    const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dueDateValue = formData.get('dueDate') as string;
        const taskData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string || undefined,
            category: formData.get('category') as string || undefined,
            priority: formData.get('priority') as 'high' | 'medium' | 'low',
            dueDate: dueDateValue ? new Date(dueDateValue).toISOString() : undefined,
        };
        if (editingTask) {
            updateTask({ ...editingTask, ...taskData });
        } else {
            addTask(taskData);
        }
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    const formatForDateTimeInput = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "";
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // --- Habit Modal Handlers ---
     const openNewHabitModal = () => {
        setEditingHabit(null);
        setHabitFormType('quantitative');
        setIsHabitModalOpen(true);
    };
    const openEditHabitModal = (habit: Habit) => {
        setEditingHabit(habit);
        setHabitFormType(habit.type);
        setIsHabitModalOpen(true);
    };
    const handleHabitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const habitData: Omit<Habit, 'id'> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as string,
            frequency: formData.get('frequency') as 'daily' | 'weekly',
            type: formData.get('type') as 'quantitative' | 'conclusive',
            dailyGoal: formData.get('type') === 'quantitative' ? parseFloat(formData.get('dailyGoal') as string) : 1,
            progressUnit: formData.get('type') === 'quantitative' ? (formData.get('progressUnit') as Habit['progressUnit']) : undefined,
        };
        if (editingHabit) {
            updateHabit({ ...editingHabit, ...habitData });
        } else {
            addHabit(habitData);
        }
        setIsHabitModalOpen(false);
        setEditingHabit(null);
    };


    const getStreak = (habitId: string) => {
        let streak = 0;
        let currentDate = new Date();
        const logs = habitLogs.filter(l => l.habitId === habitId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return 0;
        
        const goal = habit.type === 'conclusive' ? 1 : (habit.dailyGoal || 1);

        // Check from today backwards
        for (let i = 0; i < 365; i++) { // Check up to a year
            const dateToCheck = new Date();
            dateToCheck.setDate(dateToCheck.getDate() - i);
            const dateStr = getTodayDateString(dateToCheck);
            
            const log = logs.find(l => l.date === dateStr);
            if (log && log.progress >= goal) {
                streak++;
            } else if (i === 0 && !log) {
                // Today not logged yet, don't count it but don't break streak from yesterday
                continue;
            } else {
                // Streak is broken
                break;
            }
        }
        return streak;
    }
    
    // Stats Calculation
    const weeklyTaskCompletion = useMemo(() => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentTasks = tasks.filter(t => t.completedAt && new Date(t.completedAt) > oneWeekAgo);
      return recentTasks.length;
    }, [tasks]);

    const weeklyHabitCompletionRate = useMemo(() => {
      if(habits.length === 0) return 0;
      let completedCount = 0;
      let totalOpportunities = 0;
      
      for(let i=0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = getTodayDateString(date);

          habits.forEach(habit => {
              totalOpportunities++;
              const goal = habit.type === 'conclusive' ? 1 : (habit.dailyGoal || 1);
              const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateStr);
              if (log && log.progress >= goal) {
                  completedCount++;
              }
          });
      }

      return totalOpportunities > 0 ? Math.round((completedCount / totalOpportunities) * 100) : 0;
    }, [habits, habitLogs]);


    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarefas & Hábitos</h1>
                <p className="text-gray-500 dark:text-gray-400">Mantenha sua produtividade e consistência.</p>
            </header>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('tasks')} className={`${activeTab === 'tasks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tarefas</button>
                    <button onClick={() => setActiveTab('habits')} className={`${activeTab === 'habits' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Hábitos</button>
                    <button onClick={() => setActiveTab('stats')} className={`${activeTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Estatísticas</button>
                </nav>
            </div>

            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    <Card>
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-xl text-blue-600 dark:text-blue-400">A Fazer ({pendingTasks.length})</h2>
                             <button onClick={openNewTaskModal} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                + Nova Tarefa
                            </button>
                        </div>
                        <div className="space-y-3 mt-4">
                            {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${priorityClasses[task.priority]}`}>
                                    <div className="flex items-center">
                                        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <div className="ml-3">
                                            <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
                                            {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {task.dueDate && <span className="text-xs text-gray-500 hidden sm:inline">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                                      <button onClick={() => openEditTaskModal(task)} className="text-gray-400 hover:text-blue-500 p-1"><PencilIcon className="w-5 h-5"/></button>
                                      <button onClick={() => {if(confirm(`Tem certeza que deseja excluir a tarefa "${task.title}"?`)) deleteTask(task.id)}} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa pendente!</p>}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="font-bold text-xl mb-4 text-gray-500 dark:text-gray-400">Concluídas ({completedTasks.length})</h2>
                        <div className="space-y-3">
                            {completedTasks.slice(0, 5).map(task => (
                                <div key={task.id} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                    <span className="ml-3 line-through text-gray-400">{task.title}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'habits' && (
                <div className="space-y-6">
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="font-bold text-xl text-indigo-600 dark:text-indigo-400">Rastreador de Hábitos</h2>
                          <button onClick={openNewHabitModal} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                              + Novo Hábito
                          </button>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {habits.length > 0 ? habits.map(habit => {
                                const todayStr = getTodayDateString(new Date());
                                const progress = habitLogs.find(l => l.habitId === habit.id && l.date === todayStr)?.progress || 0;
                                const streak = getStreak(habit.id);

                                return (
                                <Card key={habit.id} className="!shadow-none border dark:border-gray-700">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-bold text-lg">{habit.name}</h3>
                                          {streak > 0 && <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">🔥 {streak} dias</span>}
                                        </div>
                                        <p className="text-sm text-gray-500">{habit.description || habit.category}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        <button onClick={() => openEditHabitModal(habit)} className="text-gray-400 hover:text-blue-500"><PencilIcon className="w-5 h-5"/></button>
                                        <button onClick={() => deleteHabit(habit.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                      </div>
                                    </div>
                                    <div className="mt-4">
                                      {habit.type === 'quantitative' ? (
                                        <>
                                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${habit.dailyGoal ? (progress / habit.dailyGoal) * 100 : 0}%` }}></div>
                                          </div>
                                          <div className="flex items-center justify-center gap-4 mt-3">
                                              <button onClick={() => logHabitProgress(habit.id, Math.max(0, progress - 1), todayStr)} className="text-xl font-bold w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600">-</button>
                                              <span className="text-sm text-gray-600 dark:text-gray-300 font-semibold">{progress} / {habit.dailyGoal} {habit.progressUnit?.split(' ')[0]}</span>
                                              <button onClick={() => logHabitProgress(habit.id, Math.min(habit.dailyGoal || Infinity, progress + 1), todayStr)} className="text-xl font-bold w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600">+</button>
                                          </div>
                                        </>
                                      ) : (
                                        <div className="flex items-center justify-center mt-3">
                                          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                                            <input 
                                              type="checkbox" 
                                              checked={progress >= 1}
                                              onChange={(e) => logHabitProgress(habit.id, e.target.checked ? 1 : 0, todayStr)}
                                              className="sr-only peer"
                                            />
                                            <div className="w-16 h-16 rounded-full border-4 border-gray-300 dark:border-gray-600 peer-checked:bg-green-500 peer-checked:border-green-500 flex items-center justify-center transition-colors">
                                              <svg className="w-10 h-10 text-white hidden peer-checked:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{progress >= 1 ? 'Feito!' : 'Marcar como feito'}</span>
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                </Card>
                            )}) : (
                              <div className="text-center col-span-full py-8">
                                <p className="text-gray-500 dark:text-gray-400">Você ainda não tem hábitos.</p>
                                <p className="text-gray-500 dark:text-gray-400">Clique em "Novo Hábito" para começar a rastrear!</p>
                              </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card>
                  <h2 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-200">Estatísticas da Semana</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-4xl font-bold text-green-500">{weeklyTaskCompletion}</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Tarefas Concluídas</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-4xl font-bold text-indigo-500">{weeklyHabitCompletionRate}%</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">Conclusão de Hábitos</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTask ? "Editar Tarefa" : "Nova Tarefa"}>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                        <input type="text" name="title" id="title" defaultValue={editingTask?.title || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
                        <textarea name="description" id="description" rows={2} defaultValue={editingTask?.description || ''} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                            <input type="text" name="category" id="category" defaultValue={editingTask?.category || ''} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioridade</label>
                            <select name="priority" id="priority" defaultValue={editingTask?.priority || 'medium'} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Conclusão (Opcional)</label>
                        <input type="datetime-local" name="dueDate" id="dueDate" defaultValue={formatForDateTimeInput(editingTask?.dueDate)} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsTaskModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            {editingTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            {/* Habit Modal */}
            <Modal isOpen={isHabitModalOpen} onClose={() => setIsHabitModalOpen(false)} title={editingHabit ? "Editar Hábito" : "Novo Hábito"}>
                 <form onSubmit={handleHabitSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Hábito</label>
                        <input type="text" name="name" id="name" defaultValue={editingHabit?.name || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (Opcional)</label>
                        <textarea name="description" id="description" rows={2} defaultValue={editingHabit?.description || ''} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                          <input type="text" name="category" id="category" defaultValue={editingHabit?.category || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                      </div>
                       <div>
                          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequência</label>
                          <select name="frequency" id="frequency" defaultValue={editingHabit?.frequency || 'daily'} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                              <option value="daily">Diário</option>
                              <option value="weekly">Semanal</option>
                          </select>
                      </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Hábito</label>
                        <select name="type" value={habitFormType} onChange={(e) => setHabitFormType(e.target.value as Habit['type'])} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <option value="quantitative">Quantitativo (ex: ler 30 páginas)</option>
                            <option value="conclusive">Conclusivo (ex: meditar)</option>
                        </select>
                    </div>

                    {habitFormType === 'quantitative' && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <div>
                                <label htmlFor="dailyGoal" className="block text-sm font-medium">Meta Diária</label>
                                <input type="number" name="dailyGoal" id="dailyGoal" defaultValue={editingHabit?.dailyGoal || 1} required className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label htmlFor="progressUnit" className="block text-sm font-medium">Unidade</label>
                                <select name="progressUnit" id="progressUnit" defaultValue={editingHabit?.progressUnit || 'Quantidade'} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600">
                                    <option>Tempo (min)</option>
                                    <option>Quantidade</option>
                                    <option>Livre</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => setIsHabitModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2">Cancelar</button>
                        <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            {editingHabit ? 'Salvar Alterações' : 'Adicionar Hábito'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TasksAndHabits;