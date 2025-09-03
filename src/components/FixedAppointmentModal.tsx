import React, { useState, useEffect } from 'react';
import { FixedAppointment, Recurrence } from '../types';
import Modal from './Modal';

interface FixedAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<FixedAppointment, 'id'>) => void;
  existingAppointment: FixedAppointment | null;
}

const dayOptions: Recurrence['days'] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayAbbreviations: Record<string, string> = {
    Sunday: 'D', Monday: 'S', Tuesday: 'T', Wednesday: 'Q',
    Thursday: 'Q', Friday: 'S', Saturday: 'S'
};

const FixedAppointmentModal: React.FC<FixedAppointmentModalProps> = ({ isOpen, onClose, onSave, existingAppointment }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [selectedDays, setSelectedDays] = useState<Set<Recurrence['days'][0]>>(new Set());
  const [exceptions, setExceptions] = useState<string[]>([]);
  const [newException, setNewException] = useState('');

  useEffect(() => {
    if (isOpen && existingAppointment) {
      setTitle(existingAppointment.title);
      setStartTime(existingAppointment.startTime);
      setEndTime(existingAppointment.endTime);
      setLocation(existingAppointment.location || '');
      setSelectedDays(new Set(existingAppointment.recurrence.days));
      setExceptions(existingAppointment.recurrence.exceptionDates);
    } else if (!existingAppointment) {
      // Reset form for new entry
      setTitle('');
      setStartTime('09:00');
      setEndTime('17:00');
      setLocation('');
      setSelectedDays(new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']));
      setExceptions([]);
    }
  }, [isOpen, existingAppointment]);

  const toggleDay = (day: Recurrence['days'][0]) => {
    const newSelection = new Set(selectedDays);
    if (newSelection.has(day)) {
      newSelection.delete(day);
    } else {
      newSelection.add(day);
    }
    setSelectedDays(newSelection);
  };

  const addException = () => {
    if (newException && !exceptions.includes(newException)) {
      setExceptions([...exceptions, newException].sort());
      setNewException('');
    }
  };

  const removeException = (dateToRemove: string) => {
    setExceptions(exceptions.filter(date => date !== dateToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && startTime && endTime && selectedDays.size > 0) {
      onSave({
        title,
        startTime,
        endTime,
        location: location || undefined,
        recurrence: {
          days: Array.from(selectedDays),
          exceptionDates: exceptions,
        },
      });
      onClose();
    } else {
        alert("Por favor, preencha o título, horários e selecione pelo menos um dia da semana.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingAppointment ? 'Editar Compromisso Fixo' : 'Novo Compromisso Fixo'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fa-title" className="block text-sm font-medium">Título</label>
          <input id="fa-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fa-startTime" className="block text-sm font-medium">Início</label>
            <input id="fa-startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="fa-endTime" className="block text-sm font-medium">Fim</label>
            <input id="fa-endTime" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="mt-1 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Repetir em</label>
          <div className="flex justify-around bg-gray-100 dark:bg-gray-900/50 p-2 rounded-lg">
            {dayOptions.map((day, index) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`w-10 h-10 font-bold rounded-full transition-colors ${selectedDays.has(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'}`}
              >
                {dayAbbreviations[day]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="fa-exceptions" className="block text-sm font-medium">Exceções (feriados, etc.)</label>
          <div className="flex gap-2 mt-1">
            <input id="fa-exceptions" type="date" value={newException} onChange={e => setNewException(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
            <button type="button" onClick={addException} className="bg-gray-200 dark:bg-gray-600 font-semibold px-4 rounded-lg">Add</button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {exceptions.map(date => (
              <div key={date} className="flex items-center gap-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs font-semibold px-2 py-1 rounded-full">
                <span>{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                <button type="button" onClick={() => removeException(date)} className="font-bold">×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end pt-4 gap-2">
          <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 font-semibold py-2 px-4 rounded-lg">Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">Salvar</button>
        </div>
      </form>
    </Modal>
  );
};

export default FixedAppointmentModal;
