import { FixedAppointment, Appointment } from './types';

// Helper function to get date as YYYY-MM-DD string
export const getTodayDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getYesterdayDateString = (date: Date): string => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return getTodayDateString(yesterday);
};

export const generateAppointmentsFromFixed = (fixedAppointments: FixedAppointment[], date: Date): Appointment[] => {
    const generated: Appointment[] = [];
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }) as 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    const dateStr = getTodayDateString(date);

    for (const fixed of fixedAppointments) {
        // Check if today is an exception or not a recurring day
        if (fixed.recurrence.exceptionDates.includes(dateStr) || !fixed.recurrence.days.includes(dayOfWeek)) {
            continue;
        }

        const [startHour, startMinute] = fixed.startTime.split(':').map(Number);
        const [endHour, endMinute] = fixed.endTime.split(':').map(Number);

        const startDate = new Date(date);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(endHour, endMinute, 0, 0);

        const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

        if (duration > 0) {
            generated.push({
                id: `fixed-${fixed.id}-${dateStr}`,
                title: fixed.title,
                date: startDate.toISOString(),
                duration: duration,
                isFixed: true,
                location: fixed.location,
            });
        }
    }

    return generated;
};
