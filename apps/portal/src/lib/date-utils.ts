export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDateTime = (date: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
};

export const formatRelative = (date: string | Date): string => {
    if (!date) return '';
    const now = new Date();
    const diff = new Date(date).getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    // Future
    if (diff > 0) {
        if (days === 0 && hours === 0) return 'In less than an hour';
        if (days === 0) return `In ${hours} hours`;
        if (days === 1) return 'Tomorrow';
        return `In ${days} days`;
    }

    // Past
    const absDays = Math.abs(days);
    if (absDays === 0) return 'Today';
    if (absDays === 1) return 'Yesterday';
    return `${absDays} days ago`;
};

// --- ISO Helpers for Input Fields ---

export const toLocalISOString = (date: Date): string => {
    // Returns YYYY-MM-DDTHH:mm for explicit value setting in datetime-local inputs
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.slice(0, 16); // Trim seconds/ms
};

// --- Validation Helpers ---

export const isDateFuture = (date: string | Date): boolean => {
    // Strict future check (must be at least "tomorrow" or literally > now?)
    // Requirement: "Start date cannot be before today". So Today is OK.
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
};

export const isDateAfter = (date1: string | Date, date2: string | Date): boolean => {
    return new Date(date1) > new Date(date2);
};

export const isDateBetween = (target: string | Date, start: string | Date, end: string | Date): boolean => {
    const t = new Date(target).getTime();
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return t >= s && t <= e;
};
