import React, { useState, useCallback, useMemo } from 'react';
import { PageProps, Appointment } from '../types';
import Card from '../components/Card';
import { suggestTimeSlots } from '../services/geminiService';
import { TaskIcon } from '../constants';

const Agenda: React.FC<PageProps> = ({ appointments, addAppointment }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize appointments for the selected date to prevent re-filtering on every render
  const appointmentsForSelectedDate = useMemo(() => {
    return appointments
      .filter((a) => new Date(a.date).toDateString() === selectedDate.toDateString())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, selectedDate]);

  const handleSuggestTimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuggestedSlots([]);
    try {
      const slots = await suggestTimeSlots(appointmentsForSelectedDate, 60);
      setSuggestedSlots(slots);
    } catch (err) {
      setError('Não foi possível sugerir horários. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [appointmentsForSelectedDate]);

  const handleAddAppointment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const time = formData.get('time') as string;
    
    if (title && time) {
        const [hours, minutes] = time.split(':');
        const newDate = new Date(selectedDate);
        newDate.setHours(parseInt(hours, 10));
        newDate.setMinutes(parseInt(minutes, 10));

        addAppointment({
            title,
            date: newDate.toISOString(),
            duration: 60, // Default duration
        });
        e.currentTarget.reset();
    }
  };
  
  const ReminderIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda & Compromissos</h1>
        <p className="text-gray-500 dark:text-gray-400">Visualize e gerencie seus eventos.</p>
      </header>

      <Card>
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() - 1)))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            &lt;
          </button>
          <h2 className="text-xl font-semibold text-center">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</h2>
          <button onClick={() => setSelectedDate(d => new Date(d.setDate(d.getDate() + 1)))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            &gt;
          </button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-lg mb-4">Adicionar Compromisso</h3>
            <form onSubmit={handleAddAppointment} className="flex flex-col sm:flex-row gap-3">
              <input type="text" name="title" placeholder="Título do compromisso" required className="flex-grow p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
              <input type="time" name="time" required className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
              <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Adicionar</button>
            </form>
          </Card>

          <Card>
            <h3 className="font-bold text-lg mb-4">Compromissos do dia</h3>
            {appointmentsForSelectedDate.length > 0 ? (
              <ul className="space-y-4">
                {appointmentsForSelectedDate.map(app => (
                  <li key={app.id} className={`p-4 rounded-lg flex items-start space-x-4 ${
                      app.isReminder ? 'bg-yellow-50 dark:bg-yellow-900/50' : 
                      app.isTask ? 'bg-green-50 dark:bg-green-900/50' : 
                      'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    {app.isReminder ? (
                      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg p-3">
                          <ReminderIcon className="w-5 h-5"/>
                      </div>
                    ) : app.isTask ? (
                      <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg p-3">
                          <TaskIcon className="w-5 h-5"/>
                      </div>
                    ) : (
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold rounded-lg px-3 py-2 text-center">
                        <p className="text-sm">{new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{app.title}</p>
                      {app.location && <p className="text-sm text-gray-500 dark:text-gray-400">{app.location}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Você está livre hoje! Adicione um compromisso acima.</p>
            )}
          </Card>
        </div>
        
        <div className="space-y-4">
            <Card>
                <h3 className="font-bold text-lg mb-2">IA Sugere Horários</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Encontre o melhor horário para seu próximo compromisso de 1 hora.
                </p>
                <button 
                    onClick={handleSuggestTimes}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {isLoading ? 'Analisando...' : 'Encontrar Horário Livre'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {suggestedSlots.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Horários sugeridos:</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestedSlots.map((slot, index) => (
                                <button key={index} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-3 py-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800">
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
            <Card>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-red-500">Alerta da IA:</span> Você tem muitos compromissos seguidos à tarde. Considere agendar uma pausa de 15 minutos.
                </p>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Agenda;