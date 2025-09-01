import React, { useState } from 'react';
import { OnboardingTourProps, Goal, Habit, Task } from '../types';
import { TargetIcon, CheckCircleIcon, HeartIcon, BanknotesIcon, CalendarIcon, TaskIcon as CheckTaskIcon } from '../constants';
import Card from '../components/Card';

const TourStep: React.FC<{ children: React.ReactNode, isActive: boolean }> = ({ children, isActive }) => {
    return (
        <div className={`w-full max-w-lg text-center transition-all duration-500 ease-in-out ${isActive ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-5 absolute'}`}>
            {children}
        </div>
    );
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({ user, onComplete, addGoal, addHabit, addTask, updateHealthData, addTransaction }) => {
    const [step, setStep] = useState(0);

    const nextStep = () => setStep(s => s + 1);

    const handleSkipTour = () => {
        onComplete();
    };

    const handleAddGoal = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('goalName') as string;
        if (name) {
            addGoal({ name, category: 'Pessoal', progressUnit: 'Livre', targetValue: 1 });
        }
        nextStep();
    };
    
    const handleAddHabit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('habitName') as string;
        if (name) {
            addHabit({ name, category: 'Saúde', frequency: 'daily', type: 'conclusive' });
        }
        nextStep();
    };

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('taskTitle') as string;
        if (title) {
            addTask({ title, priority: 'medium' });
        }
        nextStep();
    };
    
    const handleAddHealth = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const sleep = parseFloat(formData.get('sleep') as string);
        if (sleep) {
            updateHealthData({ sleep });
        }
        nextStep();
    };

    const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const description = formData.get('transactionDesc') as string;
        const amount = parseFloat(formData.get('transactionAmount') as string);
        if (description && amount) {
            addTransaction({ description, amount, type: 'expense', category: 'Geral', date: new Date().toISOString() });
        }
        nextStep();
    };


    const steps = [
        // Step 0: Welcome
        <TourStep isActive={step === 0}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {user.name}!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Vamos configurar sua Agenda Inteligente em alguns passos rápidos.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={nextStep} className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">Vamos começar</button>
                <button onClick={handleSkipTour} className="w-full sm:w-auto text-gray-600 dark:text-gray-400 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Pular tour</button>
            </div>
        </TourStep>,
        // Step 1: Goals
        <TourStep isActive={step === 1}>
            <TargetIcon className="w-16 h-16 mx-auto text-yellow-500"/>
            <h2 className="text-2xl font-bold mt-4">Qual é a sua principal meta?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Pode ser qualquer coisa, desde "Ler 10 livros" a "Juntar dinheiro para uma viagem".</p>
            <Card className="mt-6 text-left">
                <form onSubmit={handleAddGoal} className="space-y-4">
                    <input name="goalName" type="text" placeholder="Ex: Aprender a programar" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={nextStep} className="font-semibold text-gray-600 dark:text-gray-400 hover:underline">Pular esta etapa</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Adicionar e Continuar</button>
                    </div>
                </form>
            </Card>
        </TourStep>,
        // Step 2: Habits
        <TourStep isActive={step === 2}>
             <CheckCircleIcon className="w-16 h-16 mx-auto text-indigo-500"/>
            <h2 className="text-2xl font-bold mt-4">Qual hábito você quer construir?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Pequenas ações diárias levam a grandes resultados.</p>
            <Card className="mt-6 text-left">
                <form onSubmit={handleAddHabit} className="space-y-4">
                    <input name="habitName" type="text" placeholder="Ex: Meditar por 10 minutos" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={nextStep} className="font-semibold text-gray-600 dark:text-gray-400 hover:underline">Pular esta etapa</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Adicionar e Continuar</button>
                    </div>
                </form>
            </Card>
        </TourStep>,
        // Step 3: Tasks
        <TourStep isActive={step === 3}>
            <CheckTaskIcon className="w-16 h-16 mx-auto text-green-500"/>
            <h2 className="text-2xl font-bold mt-4">Qual a sua tarefa mais importante?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Vamos começar a organizar seu dia.</p>
            <Card className="mt-6 text-left">
                <form onSubmit={handleAddTask} className="space-y-4">
                    <input name="taskTitle" type="text" placeholder="Ex: Preparar apresentação" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={nextStep} className="font-semibold text-gray-600 dark:text-gray-400 hover:underline">Pular esta etapa</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Adicionar e Continuar</button>
                    </div>
                </form>
            </Card>
        </TourStep>,
         // Step 4: Health
        <TourStep isActive={step === 4}>
            <HeartIcon className="w-16 h-16 mx-auto text-red-500"/>
            <h2 className="text-2xl font-bold mt-4">Cuidando do seu bem-estar</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Quantas horas você costuma dormir por noite?</p>
            <Card className="mt-6 text-left">
                <form onSubmit={handleAddHealth} className="space-y-4">
                    <input name="sleep" type="number" step="0.5" placeholder="Ex: 8" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={nextStep} className="font-semibold text-gray-600 dark:text-gray-400 hover:underline">Pular esta etapa</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Adicionar e Continuar</button>
                    </div>
                </form>
            </Card>
        </TourStep>,
         // Step 5: Finances
        <TourStep isActive={step === 5}>
            <BanknotesIcon className="w-16 h-16 mx-auto text-blue-500"/>
            <h2 className="text-2xl font-bold mt-4">Organizando suas finanças</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Adicione um primeiro gasto para começar a ter controle.</p>
            <Card className="mt-6 text-left">
                <form onSubmit={handleAddTransaction} className="space-y-4">
                    <input name="transactionDesc" type="text" placeholder="Ex: Café da manhã" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <input name="transactionAmount" type="number" step="0.01" placeholder="Ex: 15.50" required className="w-full p-3 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={nextStep} className="font-semibold text-gray-600 dark:text-gray-400 hover:underline">Pular esta etapa</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700">Adicionar e Continuar</button>
                    </div>
                </form>
            </Card>
        </TourStep>,
        // Step 6: All done
        <TourStep isActive={step === 6}>
            <h1 className="text-4xl">🎉</h1>
            <h2 className="text-3xl font-bold mt-4">Tudo pronto!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sua Agenda Inteligente da Vida foi configurada com sucesso.</p>
            <div className="mt-8">
                <button onClick={onComplete} className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105">Explorar o App</button>
            </div>
        </TourStep>
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4 transition-colors duration-500">
           {steps.map((el, i) => React.cloneElement(el, {key: i}))}
        </div>
    );
};

export default OnboardingTour;
