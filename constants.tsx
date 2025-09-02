import React from 'react';
import { Page } from './types';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import TasksAndHabits from './pages/TasksAndHabits';
import Health from './pages/Health';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import Goals from './pages/Goals';
import Wellbeing from './pages/Wellbeing';
import SmartRoutine from './pages/SmartRoutine';

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TaskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a9 9 0 1118 0 9 9 0 01-18 0z" />
    </svg>
);


export const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

export const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0a.75.75 0 01.75.75v.75m0 0h.75a.75.75 0 01.75.75v.75m0 0A.75.75 0 015.25 9h-.75m0 0a.75.75 0 01-.75.75v.75m0 0a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75m0 0A.75.75 0 012.25 9h.75m0 0a.75.75 0 01.75-.75V6m0 0a.75.75 0 01.75-.75h.75M3.75 9a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.75m0 0a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V9m15-3.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-.75a.75.75 0 01.75-.75h.75z" />
    </svg>
);

export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75V3m0 18v-3.75M3 12h3.75m11.25 0H21" />
    </svg>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

export const Cog6ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995a6.45 6.45 0 010 1.912c0 .382.145.755.438.995l1.003.827c.487.402.668 1.07.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.331.183-.581.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995a6.45 6.45 0 010-1.912c0-.382-.145-.755-.438-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075-.124.072-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const WandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.992.75.75 0 11.972.972A10.5 10.5 0 113.75 3.752.75.75 0 014.57 4.57z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.022 1.05c.422-.234.907-.354 1.407-.354a10.5 10.5 0 0110.5 10.5c0 .5-.12 1.01-.354 1.407M1.05 11.022c.234.422.354.907.354 1.407 0 5.798 4.702 10.5 10.5 10.5.5 0 1.01-.12 1.407-.354" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l2.25 2.25M18.75 9.75l-2.25-2.25M16.5 7.5V5.25m0 2.25H14.25m2.25 0l-2.25 2.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l1.5 1.5M13.5 5.25l-1.5-1.5M12 3.75V1.5m0 2.25H9.75m2.25 0l-1.5 1.5M9 15l-1.5 1.5M7.5 16.5l1.5-1.5M9 15v2.25m0-2.25H6.75m2.25 0l1.5 1.5M18.75 12l1.5 1.5M20.25 13.5l-1.5-1.5M18.75 12v-2.25m0 2.25h2.25m-2.25 0l1.5-1.5" />
    </svg>
);


export const NAV_ITEMS = [
  { id: Page.Dashboard, label: 'Home', icon: HomeIcon },
  { id: Page.Agenda, label: 'Agenda', icon: CalendarIcon },
  { id: Page.Tasks, label: 'Tarefas', icon: CheckCircleIcon },
  { id: Page.SmartRoutine, label: 'Rotina', icon: WandIcon },
  { id: Page.Wellbeing, label: 'Bem-Estar', icon: SparklesIcon },
  { id: Page.Health, label: 'Saúde', icon: HeartIcon },
  { id: Page.Finances, label: 'Finanças', icon: BanknotesIcon },
  { id: Page.Goals, label: 'Metas', icon: TargetIcon },
  { id: Page.Settings, label: 'Ajustes', icon: Cog6ToothIcon },
].sort((a,b) => { // Keep Settings last
    if(a.id === Page.Settings) return 1;
    if(b.id === Page.Settings) return -1;
    return 0;
});

export const PAGE_COMPONENTS = {
  [Page.Dashboard]: Dashboard,
  [Page.Agenda]: Agenda,
  [Page.Tasks]: TasksAndHabits,
  [Page.SmartRoutine]: SmartRoutine,
  [Page.Health]: Health,
  [Page.Finances]: Finances,
  [Page.Goals]: Goals,
  [Page.Wellbeing]: Wellbeing,
  [Page.Settings]: Settings,
};