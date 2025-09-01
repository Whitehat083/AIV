import React from 'react';
import { Page, PageProps, Task } from '../types';
import Card from '../components/Card';
import { HomeIcon } from '../constants';

const Dashboard: React.FC<PageProps> = ({ user, appointments, tasks, habits, healthData, goals, setActivePage }) => {
  const today = new Date();
  const todayAppointments = appointments.filter(a => new Date(a.date).toDateString() === today.toDateString());
  const pendingTasks = tasks.filter(t => !t.completed);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  
  const ongoingGoals = goals.filter(g => g.currentProgress < g.targetValue);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getGreeting()}, {user.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400">Aqui está um resumo do seu dia.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compromissos do Dia */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-4">Compromissos de Hoje</h2>
            {todayAppointments.length > 0 ? (
                <ul className="space-y-3">
                    {todayAppointments.slice(0, 3).map(app => (
                        <li key={app.id} className="flex items-start space-x-3">
                            <div className={`${app.isReminder ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} font-semibold rounded-md px-2 py-1 text-sm`}>
                                {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{app.title}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhum compromisso para hoje.</p>
            )}
        </Card>

        {/* Tarefas Pendentes */}
        <Card>
            <h2 className="font-bold text-lg text-green-600 dark:text-green-400 mb-4">Tarefas Pendentes</h2>
            {pendingTasks.length > 0 ? (
                <ul className="space-y-2">
                    {pendingTasks.slice(0, 3).map(task => (
                        <li key={task.id} className="flex items-center">
                            <span className="w-2 h-2 rounded-full mr-3 bg-green-500"></span>
                            <span>{task.title}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Todas as tarefas concluídas!</p>
            )}
        </Card>
        
        {/* Hábitos */}
        <Card>
          <h2 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-4">Progresso dos Hábitos</h2>
          <div className="space-y-3">
            {habits.map(habit => (
              <div key={habit.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{habit.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{habit.completed}/{habit.goal}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(habit.completed / habit.goal) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Saúde Rápida */}
        <Card>
            <h2 className="font-bold text-lg text-red-500 dark:text-red-400 mb-4">Resumo da Saúde</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="font-bold text-xl">{healthData.steps.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Passos</p>
                </div>
                <div>
                    <p className="font-bold text-xl">{healthData.sleep}h</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sono</p>
                </div>
                <div>
                    <p className="font-bold text-xl">{healthData.water}L</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Água</p>
                </div>
            </div>
        </Card>

        {/* Minhas Metas */}
        <Card className="col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-yellow-600 dark:text-yellow-400">Minhas Metas</h2>
              <button onClick={() => setActivePage(Page.Goals)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver todas</button>
            </div>
            {ongoingGoals.length > 0 ? (
                <div className="space-y-4">
                    {ongoingGoals.slice(0, 3).map(goal => (
                        <div key={goal.id}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{goal.name}</span>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                    {Math.round((goal.currentProgress / goal.targetValue) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(goal.currentProgress / goal.targetValue) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">Nenhuma meta em andamento. Que tal criar uma?</p>
            )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
