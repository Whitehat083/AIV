import React, { useState } from 'react';
import { User } from '../types';
import Card from '../components/Card';

interface OnboardingProps {
  onRegister: (user: User) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name && dob) {
      setIsSubmitting(true);
      // Simulate a small delay for better UX
      setTimeout(() => {
        onRegister({ name, dob });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4 transition-colors duration-500">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
      <div className="w-full max-w-md fade-in">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">Bem-vindo(a) à AIV</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Sua Agenda Inteligente da Vida</p>
        </header>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">Vamos começar!</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Qual é o seu nome?
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 transition-colors"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Nascimento
              </label>
              <div className="mt-1">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-300 disabled:hover:scale-100"
                disabled={!name || !dob || isSubmitting}
              >
                {isSubmitting ? 'Configurando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
