import React from 'react';
import { PageProps } from '../types';
import Card from '../components/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

const Finances: React.FC<PageProps> = ({ transactions, goals, addTransaction }) => {
  const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const financialGoal = goals.find(g => g.category === 'Financeiro');

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const type = formData.get('type') as 'income' | 'expense';
    const category = formData.get('category') as string;
    
    if (description && amount && type && category) {
        addTransaction({
            description,
            amount: amount, // Always positive
            type,
            category,
            date: new Date().toISOString(),
        });
        e.currentTarget.reset();
    }
  };


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finanças & Metas</h1>
        <p className="text-gray-500 dark:text-gray-400">Controle suas finanças e alcance seus objetivos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-center items-center">
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Saldo Atual</h3>
            <p className={`text-5xl font-bold mt-2 ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                R$ {balance.toFixed(2)}
            </p>
        </Card>
        {financialGoal && (
          <Card>
            <h3 className="font-bold text-lg mb-2">{financialGoal.name}</h3>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium">Progresso</span>
              <span className="font-semibold">R$ {financialGoal.currentProgress.toFixed(2)} / R$ {financialGoal.targetValue.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div className="bg-yellow-500 h-4 rounded-full" style={{ width: `${(financialGoal.currentProgress / financialGoal.targetValue) * 100}%` }}></div>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <h2 className="font-bold text-xl mb-4">Adicionar Transação</h2>
        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input type="text" name="description" placeholder="Descrição" required className="lg:col-span-2 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            <input type="number" step="0.01" name="amount" placeholder="Valor (R$)" required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            <select name="type" required className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Adicionar</button>
            <input type="text" name="category" placeholder="Categoria" required className="sm:col-span-2 lg:col-span-5 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 mt-3"/>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <h2 className="font-bold text-xl mb-4">Últimas Transações</h2>
            <ul className="space-y-3">
              {transactions.length > 0 ? transactions.slice(0,5).map(t => (
                <li key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.category}</p>
                  </div>
                  <p className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </p>
                </li>
              )) : <p className="text-gray-500 dark:text-gray-400">Nenhuma transação registrada.</p>}
            </ul>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <h2 className="font-bold text-xl mb-4 text-center">Gastos por Categoria</h2>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
      </div>
       <Card>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-red-500">Alerta da IA:</span> Seus gastos com "Alimentação" este mês estão 20% acima da média. Considere cozinhar em casa com mais frequência.
          </p>
      </Card>
    </div>
  );
};

export default Finances;
