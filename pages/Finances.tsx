import React, { useState } from 'react';
import { PageProps, Transaction } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

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

const Finances: React.FC<PageProps> = ({ transactions, goals, addTransaction, updateTransaction, deleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  const openNewTransactionModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditTransactionModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const transactionData = {
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as 'income' | 'expense',
        category: formData.get('category') as string,
        date: formData.get('date') ? new Date(formData.get('date') as string).toISOString() : new Date().toISOString(),
    };
    
    if (transactionData.description && transactionData.amount && transactionData.type && transactionData.category) {
        if (editingTransaction) {
            updateTransaction({ ...editingTransaction, ...transactionData });
        } else {
            addTransaction(transactionData);
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
    }
  };

  const handleDeleteTransaction = (id: string, description: string) => {
    if (confirm(`Tem certeza de que deseja excluir a transação "${description}"?`)) {
      deleteTransaction(id);
    }
  }

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
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl">Últimas Transações</h2>
                <button onClick={openNewTransactionModal} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    + Nova Transação
                </button>
            </div>
            <ul className="space-y-3">
              {transactions.length > 0 ? transactions.slice(0,5).map(t => (
                <li key={t.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.category} - {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => openEditTransactionModal(t)} className="text-gray-400 hover:text-blue-500 p-1"><PencilIcon className="w-5 h-5"/></button>
                        <button onClick={() => handleDeleteTransaction(t.id, t.description)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                  </div>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}>
        <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                <input type="text" name="description" id="description" defaultValue={editingTransaction?.description || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
                    <input type="number" step="0.01" name="amount" id="amount" defaultValue={editingTransaction?.amount || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                    <select name="type" id="type" defaultValue={editingTransaction?.type || 'expense'} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
                    <input type="text" name="category" id="category" defaultValue={editingTransaction?.category || ''} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
                    <input type="date" name="date" id="date" defaultValue={editingTransaction ? new Date(editingTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"/>
                </div>
            </div>
             <div className="flex justify-end pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 mr-2">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    {editingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
                </button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default Finances;