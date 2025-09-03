import React from 'react';
import { PageProps } from '../types';
import Card from '../../components/Card';
import { SparklesIcon } from '../constants';

const Motivation: React.FC<PageProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Motivação Diária</h1>
        <p className="text-gray-500 dark:text-gray-400">Seu impulso de inspiração personalizado pela IA.</p>
      </header>

      {user.plan === 'free' ? (
        <Card className="text-center">
            <SparklesIcon className="w-16 h-16 mx-auto text-yellow-400" />
            <h2 className="text-2xl font-bold mt-4">Desbloqueie a Motivação Personalizada</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6 max-w-md mx-auto">
                No plano Premium, a IA analisa seu progresso e humor para gerar mensagens, dicas e desafios que realmente falam com você.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-opacity">
                Fazer Upgrade
            </button>
        </Card>
      ) : (
        <Card>
            <h2 className="font-bold text-xl mb-4">Sua Dose de Inspiração</h2>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                <p className="italic text-lg text-blue-800 dark:text-blue-200">"A disciplina é a ponte entre metas e realizações. Você está construindo essa ponte, um hábito de cada vez. Continue firme!"</p>
                <p className="text-right mt-4 font-semibold text-blue-600 dark:text-blue-400">- Sua IA Coach</p>
            </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <h3 className="font-bold text-lg mb-2">Reflexão do Dia</h3>
            <p>Qual pequena ação hoje te deixará mais perto da sua grande meta amanhã?</p>
        </Card>
         <Card>
            <h3 className="font-bold text-lg mb-2">Dica Rápida</h3>
            <p>Tente a "Regra dos 2 Minutos": se uma tarefa leva menos de dois minutos, faça-a imediatamente.</p>
        </Card>
      </div>
    </div>
  );
};

export default Motivation;
