
import React from 'react';
import { PageProps } from '../types';
import Card from '../components/Card';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
};


const Settings: React.FC<PageProps> = ({ user, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400">Personalize sua experiência, {user.name}.</p>
      </header>
      
      <Card>
        <h2 className="font-bold text-xl mb-4">Geral</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-4 flex justify-between items-center">
            <span>Modo Escuro</span>
            <ToggleSwitch checked={isDarkMode} onChange={toggleDarkMode} />
          </li>
          <li className="py-4 flex justify-between items-center">
            <span>Notificações Inteligentes da IA</span>
            <ToggleSwitch checked={true} onChange={() => {}} />
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold text-xl mb-4">Integrações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Conecte seus aplicativos para sincronizar dados automaticamente.</p>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-4 flex justify-between items-center">
            <span>Google Calendar</span>
            <ToggleSwitch checked={true} onChange={() => {}} />
          </li>
          <li className="py-4 flex justify-between items-center">
            <span>Google Fit / Apple Saúde</span>
            <ToggleSwitch checked={false} onChange={() => {}} />
          </li>
           <li className="py-4 flex justify-between items-center">
            <span>Conexão Bancária (Open Banking)</span>
            <ToggleSwitch checked={false} onChange={() => {}} />
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-bold text-xl mb-4">Conta</h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-center">
          <p className="font-semibold text-blue-800 dark:text-blue-200">Você está no plano Gratuito.</p>
          <button className="mt-2 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Fazer Upgrade para Premium
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
