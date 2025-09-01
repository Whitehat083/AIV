
import React from 'react';
import { PageProps } from '../types';
import Card from '../components/Card';

const priorityClasses = {
  high: 'border-red-500',
  medium: 'border-yellow-500',
  low: 'border-green-500',
};

const TasksAndHabits: React.FC<PageProps> = ({ tasks, habits, addTask, toggleTask, updateHabit }) => {
  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const priority = formData.get('priority') as 'high' | 'medium' | 'low';
    if (title && priority) {
        addTask({ title, priority });
        e.currentTarget.reset();
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarefas & Hábitos</h1>
        <p className="text-gray-500 dark:text-gray-400">Mantenha sua produtividade e consistência.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <h2 className="font-bold text-xl mb-4 text-blue-600 dark:text-blue-400">Nova Tarefa</h2>
            <form onSubmit={handleAddTask} className="space-y-3">
              <input type="text" name="title" placeholder="Descreva a tarefa..." required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
              <select name="priority" defaultValue="medium" required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                <option value="low">Baixa Prioridade</option>
                <option value="medium">Média Prioridade</option>
                <option value="high">Alta Prioridade</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Adicionar Tarefa</button>
            </form>
          </Card>
          <Card>
            <h2 className="font-bold text-xl mb-4 text-blue-600 dark:text-blue-400">Lista de Tarefas</h2>
            <div className="space-y-3">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${priorityClasses[task.priority]} bg-gray-50 dark:bg-gray-700`}>
                  <div className="flex items-center">
                    <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className={`ml-3 ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
                  </div>
                  <div className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              )) : <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa. Adicione uma acima!</p>}
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="font-bold text-xl mb-4 text-indigo-600 dark:text-indigo-400">Rastreador de Hábitos</h2>
          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{habit.title}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateHabit(habit.id, habit.completed - 1)} className="text-lg font-bold w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600">-</button>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{habit.completed} / {habit.goal}</span>
                    <button onClick={() => updateHabit(habit.id, habit.completed + 1)} className="text-lg font-bold w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600">+</button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-indigo-500 h-3 rounded-full" style={{ width: `${(habit.completed / habit.goal) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-blue-500">Sugestão da IA:</span> Você adiou "Finalizar relatório" duas vezes. Tente dividi-lo em tarefas menores para começar.
          </p>
      </Card>
    </div>
  );
};

export default TasksAndHabits;
