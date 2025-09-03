
import React, { useState } from 'react';
import { PageProps, HealthData } from '../types';
import Card from '../../components/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const healthChartData = [
  { name: 'Seg', Passos: 4300, Sono: 7 },
  { name: 'Ter', Passos: 5600, Sono: 6.5 },
  { name: 'Qua', Passos: 8200, Sono: 8 },
  { name: 'Qui', Passos: 6750, Sono: 7.5 },
  { name: 'Sex', Passos: 9100, Sono: 6 },
  { name: 'Sáb', Passos: 12040, Sono: 8.5 },
  { name: 'Dom', Passos: 3200, Sono: 9 },
];

const Health: React.FC<PageProps> = ({ healthData, updateHealthData }) => {
  const [localHealthData, setLocalHealthData] = useState<HealthData>(healthData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalHealthData({
        ...localHealthData,
        [e.target.name]: parseFloat(e.target.value) || 0
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateHealthData(localHealthData);
  };
    
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saúde & Bem-estar</h1>
        <p className="text-gray-500 dark:text-gray-400">Acompanhe suas métricas de saúde.</p>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="text-center">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Passos Hoje</h3>
            <p className="text-4xl font-bold mt-2">{healthData.steps.toLocaleString()}</p>
            <p className="text-gray-500 dark:text-gray-400">Meta: 10,000</p>
        </Card>
        <Card className="text-center">
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Sono Ontem</h3>
            <p className="text-4xl font-bold mt-2">{healthData.sleep}h</p>
            <p className="text-gray-500 dark:text-gray-400">Meta: 8h</p>
        </Card>
        <Card className="text-center">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Hidratação Hoje</h3>
            <p className="text-4xl font-bold mt-2">{healthData.water}L</p>
            <p className="text-gray-500 dark:text-gray-400">Meta: 2.5L</p>
        </Card>
      </div>
      
      <Card>
          <h2 className="font-bold text-xl mb-4">Registrar Dados Manuais</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passos</label>
                <input type="number" name="steps" id="steps" value={localHealthData.steps} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
                <label htmlFor="sleep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sono (h)</label>
                <input type="number" step="0.1" name="sleep" id="sleep" value={localHealthData.sleep} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
             <div>
                <label htmlFor="water" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Água (L)</label>
                <input type="number" step="0.1" name="water" id="water" value={localHealthData.water} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Salvar</button>
          </form>
      </Card>

      <Card>
        <h2 className="font-bold text-xl mb-4">Resumo da Semana</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={healthChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                  borderColor: '#4b5563',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar yAxisId="left" dataKey="Passos" fill="#3b82f6" name="Passos" />
              <Bar yAxisId="right" dataKey="Sono" fill="#8b5cf6" name="Horas de Sono" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-indigo-500">Sugestão da IA:</span> Sua média de sono está um pouco abaixo do ideal. Tente dormir 30 minutos mais cedo hoje para se recuperar.
          </p>
      </Card>

    </div>
  );
};

export default Health;
