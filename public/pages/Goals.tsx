import React, { useState } from 'react';
import { PageProps, Goal } from '../types';
import Card from '../../components/Card';

const GoalCard: React.FC<{ goal: Goal; onUpdate: (id: string, progress: number) => void; onDelete: (id: string) => void; }> = ({ goal, onUpdate, onDelete }) => {
  const [progress, setProgress] = useState(goal.currentProgress);
  const percentage = goal.targetValue > 0 ? (goal.currentProgress / goal.targetValue) * 100 : 0;
  
  const handleUpdate = () => {
      onUpdate(goal.id, progress);
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir a meta "${goal.name}"? Esta ação não pode ser desfeita.`)) {
      onDelete(goal.id);
    }
  };
  
  return (
    <Card className="flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{goal.name}</h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full inline-block mt-1">{goal.category}</span>
                </div>
                <button 
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label={`Excluir meta ${goal.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            {goal.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{goal.description}</p>}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1 text-sm font-medium">
                    <span>Progresso</span>
                    <span>{goal.currentProgress.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.progressUnit.split(' ')[0]}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  <div className="bg-green-500 h-4 rounded-full text-center text-white text-xs font-bold" style={{ width: `${percentage}%` }}>
                    {Math.round(percentage)}%
                  </div>
                </div>
                {goal.deadline && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>}
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="text-sm font-medium">Atualizar Progresso</label>
            <div className="flex gap-2 mt-1">
                <input 
                    type="number" 
                    value={progress}
                    onChange={(e) => setProgress(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleUpdate} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Salvar</button>
            </div>
        </div>
    </Card>
  )
}

const Goals: React.FC<PageProps> = ({ goals, addGoal, updateGoal, deleteGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const goalCategories = ["Viagem", "Casamento", "Leitura", "Saúde", "Esportes", "Educação", "Financeiro"];
  
  const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGoal = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        progressUnit: formData.get('progressUnit') as Goal['progressUnit'],
        targetValue: parseFloat(formData.get('targetValue') as string),
        deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : undefined,
    };
    
    if (newGoal.name && newGoal.category && newGoal.progressUnit && newGoal.targetValue) {
        addGoal(newGoal);
        e.currentTarget.reset();
        setShowForm(false);
    }
  };

  const handleUpdateGoal = (id: string, currentProgress: number) => {
    const goal = goals.find(g => g.id === id);
    if(goal) {
        updateGoal(id, { currentProgress: Math.min(currentProgress, goal.targetValue) });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Metas</h1>
            <p className="text-gray-500 dark:text-gray-400">Crie, acompanhe e realize seus sonhos.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            {showForm ? 'Cancelar' : 'Nova Meta'}
        </button>
      </header>

      {showForm && (
        <Card>
            <h2 className="font-bold text-xl mb-4">Criar Nova Meta</h2>
            <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium">Nome da Meta</label>
                    <input type="text" name="name" id="name" required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium">Categoria</label>
                    <input list="categories" name="category" id="category" required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <datalist id="categories">
                        {goalCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div>
                    <label htmlFor="progressUnit" className="block text-sm font-medium">Unidade de Progresso</label>
                    <select name="progressUnit" id="progressUnit" required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option>Dinheiro (R$)</option>
                        <option>Tempo (horas)</option>
                        <option>Distância (km)</option>
                        <option>Quantidade</option>
                        <option>Livre</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="targetValue" className="block text-sm font-medium">Valor-Alvo</label>
                    <input type="number" name="targetValue" id="targetValue" required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium">Data Limite (Opcional)</label>
                    <input type="date" name="deadline" id="deadline" className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium">Descrição</label>
                    <textarea name="description" id="description" rows={3} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
                </div>
                <div className="md:col-span-2 text-right">
                    <button type="submit" className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Salvar Meta</button>
                </div>
            </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => <GoalCard key={goal.id} goal={goal} onUpdate={handleUpdateGoal} onDelete={deleteGoal} />)}
      </div>

    </div>
  );
};

export default Goals;