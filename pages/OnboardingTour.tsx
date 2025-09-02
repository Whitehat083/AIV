import React, { useState } from 'react';
import { OnboardingTourProps } from '../types';
import { HomeIcon, CalendarIcon, CheckCircleIcon, SparklesIcon, HeartIcon, BanknotesIcon, TargetIcon } from '../constants';

const OnboardingTour: React.FC<OnboardingTourProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(0);

    const nextStep = () => setStep(s => s + 1);

    const handleSkipTour = () => {
        onComplete();
    };

    const tourSteps = [
        // 0: Welcome
        {
            isSpecial: true,
            content: (
                <>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Bem-vindo(a) ao tour, {user.name}!</h1>
                    <p className="text-gray-300 mt-2 max-w-sm mx-auto">Vamos descobrir como a AIV pode transformar sua rotina em uma experiência extraordinária.</p>
                    <div className="mt-8">
                        <button 
                          onClick={nextStep} 
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 duration-300"
                        >
                          Iniciar Tour
                        </button>
                    </div>
                </>
            )
        },
        // 1: Dashboard
        {
            icon: HomeIcon,
            title: "Dashboard: Sua Central de Comando",
            description: "Aqui você terá uma visão geral do seu dia, com seus compromissos, tarefas, hábitos e uma dose de motivação com a ajuda da IA."
        },
        // 2: Agenda
        {
            icon: CalendarIcon,
            title: "Agenda Inteligente",
            description: "Organize seus compromissos e deixe que a IA sugira os melhores horários livres para você, evitando conflitos."
        },
        // 3: Tasks & Habits
        {
            icon: CheckCircleIcon,
            title: "Tarefas e Hábitos",
            description: "Gerencie suas tarefas pendentes e construa hábitos consistentes. Acompanhe seu progresso e mantenha o foco."
        },
        // 4: Wellbeing
        {
            icon: SparklesIcon,
            title: "Bem-Estar e Mindfulness",
            description: "Registre seu humor, receba insights emocionais da IA e faça exercícios de respiração para relaxar e se recentralizar."
        },
        // 5: Health
        {
            icon: HeartIcon,
            title: "Saúde em Foco",
            description: "Monitore suas métricas de saúde como passos, sono e hidratação para manter um estilo de vida equilibrado e saudável."
        },
        // 6: Finances
        {
            icon: BanknotesIcon,
            title: "Controle Financeiro",
            description: "Acompanhe suas receitas e despesas, visualize gastos por categoria e receba alertas inteligentes para alcançar suas metas financeiras."
        },
        // 7: Goals
        {
            icon: TargetIcon,
            title: "Metas e Sonhos",
            description: "Defina e acompanhe suas metas de longo prazo. Divida-as em passos menores e celebre cada conquista no caminho."
        },
        // 8: All done
        {
            isSpecial: true,
            content: (
                <>
                    <h1 className="text-5xl">🎉</h1>
                    <h2 className="text-3xl font-bold mt-4 text-white tracking-tight">Tudo pronto!</h2>
                    <p className="text-gray-300 mt-2">Você está pronto para organizar sua vida de forma mais inteligente.</p>
                    <div className="mt-8">
                        <button 
                          onClick={onComplete} 
                          className="bg-gradient-to-r from-green-400 to-teal-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 transition-all transform hover:scale-105 duration-300"
                        >
                          Explorar o App
                        </button>
                    </div>
                </>
            )
        }
    ];
    
    const currentStepData = tourSteps[step];
    const progressPercentage = (step / (tourSteps.length - 1)) * 100;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 font-sans transition-opacity duration-300">
             <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>
            
            <div key={step} className="w-full max-w-md animate-fade-in-up text-center">
                {currentStepData.isSpecial ? (
                    currentStepData.content
                ) : (
                    <div className="relative text-center shadow-2xl bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
                        {currentStepData.icon && <currentStepData.icon className="w-16 h-16 mx-auto text-blue-400" />}
                        <h2 className="text-2xl font-bold mt-4 text-white tracking-tight">{currentStepData.title}</h2>
                        <p className="text-gray-300 mt-2 min-h-[72px]">
                            {currentStepData.description}
                        </p>
                        <div className="mt-6">
                            <button 
                              onClick={nextStep} 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:shadow-blue-500/40 transition-all transform hover:scale-105"
                            >
                              Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer with progress bar and skip button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 w-full max-w-md mx-auto">
                 {step > 0 && step < tourSteps.length -1 && (
                    <div className="flex items-center justify-between">
                        <button onClick={handleSkipTour} className="text-gray-400 hover:text-white font-semibold text-sm transition-colors">Pular Tour</button>
                        <span className="text-gray-300 text-sm font-medium">{step} / {tourSteps.length - 2}</span>
                    </div>
                 )}
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;