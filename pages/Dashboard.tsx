import React from 'react';
import { Page, PageProps } from '../types';
import Card from '../components/Card';
import { getTodayDateString } from '../utils/dateUtils';
import { SparklesIcon } from '../constants';

const Dashboard: React.FC<PageProps> = (props) => {
  const { user, appointments, tasks, habits, habitLogs, healthData, goals, motivationalQuote, weeklyChallenge, setActivePage, toggleTask, logHabitProgress } = props;
  const today = new Date();
  const todayStr = getTodayDateString(today);

  const todayAppointments = appointments.filter(a => new Date(a.date).toDateString() === today.toDateString());
  const todayTasks = tasks.filter(t => !t.completed && (!t.dueDate || new Date(t.dueDate).toDateString() === today.toDateString()));
  
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };
  
  const ongoingGoals = goals.filter(g => g.currentProgress < g.targetValue);
  
  const getHabitProgress = (habitId: string) => {
    const log = habitLogs.find(l => l.habitId === habitId && l.date === todayStr);
    return log ? log.progress : 0;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getGreeting()}, {user.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400">Aqui está um resumo do seu dia.</p>
      </header>
      
      {/* Wellbeing Card */}
       <Card className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                  <SparklesIcon className="w-8 h-8 text-blue-500 dark:text-blue-400"/>
              </div>
              <div className="flex-1">
                  <h2 className="font-bold text-lg text-blue-800 dark:text-blue-200">Seu Momento de Bem-Estar</h2>
                  <p className="text-blue-700 dark:text-blue-300 italic mt-1">"{motivationalQuote}"</p>
                  {weeklyChallenge && !weeklyChallenge.isCompleted && (
                      <div className="mt-3">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-300">Desafio da Semana</p>
                          <div className="flex justify-between items-center text-sm mt-1">
                              <span className="font-medium">{habits.find(h => h.id === weeklyChallenge.habitId)?.name}</span>
                              <span className="font-bold">{weeklyChallenge.progress}/{weeklyChallenge.target}</span>
                          </div>
                          <div className="w-full bg-blue-100 dark:bg-blue-800 rounded-full h-2 mt-1">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(weeklyChallenge.progress / weeklyChallenge.target) * 100}%` }}></div>
                          </div>
                      </div>
                  )}
                  <div className="mt-4 flex gap-2">
                      <button onClick={() => setActivePage(Page.Wellbeing)} className="text-xs font-semibold bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700">
                          Respirar
                      </button>
                      <button onClick={() => setActivePage(Page.Wellbeing)} className="text-xs font-semibold bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700">
                          Ver Diário
                      </button>
                  </div>
              </div>
          </div>
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Compromissos do Dia */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
            <h2 className="font-bold text-lg text-gray-600 dark:text-gray-300 mb-4">Compromissos de Hoje</h2>
            {todayAppointments.length > 0 ? (
                <ul className="space-y-3">
                    {todayAppointments.slice(0, 3).map(app => (
                        <li key={app.id} className="flex items-start space-x-3">
                            <div className={`${app.isReminder ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' : app.isTask ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'} font-semibold rounded-md px-2 py-1 text-sm`}>
                                {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{app.title}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhum compromisso para hoje.</p>
            )}
             <button onClick={() => setActivePage(Page.Agenda)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-4">Ver agenda</button>
        </Card>

        {/* Tarefas de Hoje */}
        <Card>
            <h2 className="font-bold text-lg text-green-600 dark:text-green-400 mb-4">Tarefas de Hoje</h2>
            {todayTasks.length > 0 ? (
                <ul className="space-y-2">
                    {todayTasks.slice(0, 3).map(task => (
                        <li key={task.id} className="flex items-center">
                           <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                           <span className="ml-3">{task.title}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa para hoje!</p>
            )}
             <button onClick={() => setActivePage(Page.Tasks)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-4">Ver todas</button>
        </Card>
        
        {/* Hábitos de Hoje */}
        <Card>
          <h2 className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mb-4">Hábitos de Hoje</h2>
          <div className="space-y-3">
            {habits.length > 0 ? habits.slice(0,2).map(habit => {
              const progress = getHabitProgress(habit.id);
              
              if (habit.type === 'conclusive') {
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <span className="font-medium">{habit.name}</span>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={progress >= 1}
                      onChange={(e) => logHabitProgress(habit.id, e.target.checked ? 1 : 0, todayStr)}
                      />
                  </div>
                )
              }

              const percentage = habit.dailyGoal ? (progress / habit.dailyGoal) * 100 : 0;
              return (
                <div key={habit.id}>
                   <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{habit.name}</span>
                    {habit.dailyGoal && <span className="text-sm text-gray-500 dark:text-gray-400">{progress}/{habit.dailyGoal}</span>}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              )
            }) : (
              <p className="text-gray-500 dark:text-gray-400">Nenhum hábito rastreado.</p>
            )}
          </div>
           <button onClick={() => setActivePage(Page.Tasks)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-4">Ver todos</button>
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