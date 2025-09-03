import React, { useState } from 'react';
import { PageProps, FixedAppointment, User } from '../types';
import Card from '../../components/Card';
import FixedAppointmentModal from '../../components/FixedAppointmentModal';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
};

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09.92-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


const Settings: React.FC<PageProps> = (props) => {
  const { user, isDarkMode, toggleDarkMode, fixedAppointments, addFixedAppointment, updateFixedAppointment, deleteFixedAppointment, openUpgradeModal, setUser } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<FixedAppointment | null>(null);

  const openEditModal = (appointment: FixedAppointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const openNewModal = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const dayAbbreviations = {
      Sunday: 'Dom', Monday: 'Seg', Tuesday: 'Ter', Wednesday: 'Qua',
      Thursday: 'Qui', Friday: 'Sex', Saturday: 'Sáb'
  };
  const weekOrder: (keyof typeof dayAbbreviations)[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const handleManageSubscription = () => {
      // In a real app, this would redirect to the Stripe Customer Portal
      alert("Redirecionando para o portal de assinaturas... (simulação)");
  };
  
  const handleDowngrade = () => {
      if (confirm("Tem certeza que deseja voltar para o plano gratuito? Você perderá o acesso ilimitado à IA.")) {
        setUser((prevUser: User | null) => prevUser ? {...prevUser, plan: 'free'} : null);
      }
  }


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
        <h2 className="font-bold text-xl mb-4">Meu Plano</h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-center">
            {user.plan === 'free' ? (
                <>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">Você está no plano <span className="font-bold">Gratuito</span>.</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1"> Obtenha usos ilimitados da IA e mais!</p>
                    <button onClick={openUpgradeModal} className="mt-3 bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Fazer Upgrade para Premium
                    </button>
                </>
            ) : (
                 <>
                    <p className="font-semibold text-green-800 dark:text-green-200">Você está no plano <span className="font-bold">Premium</span> ✨</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Aproveite todos os benefícios da IA ilimitada!</p>
                    <div className="mt-3 flex justify-center gap-2">
                        <button onClick={handleManageSubscription} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                            Gerenciar Assinatura
                        </button>
                         <button onClick={handleDowngrade} className="text-sm text-gray-500 hover:underline">
                            Voltar para o plano gratuito
                        </button>
                    </div>
                </>
            )}
        </div>
      </Card>

      <Card>
          <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl">Compromissos Fixos</h2>
              <button onClick={openNewModal} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  + Novo
              </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Cadastre atividades recorrentes (trabalho, academia) para que a IA planeje sua rotina ao redor delas.</p>
          <div className="space-y-3">
              {fixedAppointments.length > 0 ? fixedAppointments.map(app => (
                  <div key={app.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex justify-between items-center">
                      <div>
                          <p className="font-semibold">{app.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{app.startTime} - {app.endTime}</p>
                          <div className="flex gap-1 mt-1">
                            {weekOrder
                                .filter(day => app.recurrence.days.includes(day))
                                .map(day => (
                                    <span key={day} className="text-xs font-bold w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                        {dayAbbreviations[day].slice(0,1)}
                                    </span>
                                ))
                            }
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => openEditModal(app)} className="text-gray-400 hover:text-blue-500 p-1"><PencilIcon className="w-5 h-5"/></button>
                          <button onClick={() => deleteFixedAppointment(app.id)} className="text-gray-400 hover:text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button>
                      </div>
                  </div>
              )) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum compromisso fixo cadastrado.</p>
              )}
          </div>
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

       <FixedAppointmentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
              if (editingAppointment) {
                  updateFixedAppointment({ ...editingAppointment, ...data });
              } else {
                  addFixedAppointment(data);
              }
              setIsModalOpen(false);
          }}
          existingAppointment={editingAppointment}
      />
    </div>
  );
};

export default Settings;
