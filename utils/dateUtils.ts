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
