import { addDays, addWeeks, isAfter, isSameDay, parseISO, startOfDay } from 'date-fns';
import type { LogInterval } from '../types/models';

/**
 * Calculates the next expected log submission date based on the interval and last log date.
 * 
 * @param interval 'daily' or 'weekly'
 * @param lastLogDate Date string (ISO) or Date object of the last entry. If null, implies start date (handled by caller typically, or defaults to today)
 * @returns Date object of the next due date
 */
export function getNextLogDate(interval: LogInterval, lastLogDate: string | Date): Date {
    const date = typeof lastLogDate === 'string' ? parseISO(lastLogDate) : lastLogDate;

    if (interval === 'daily') {
        // Next day (skipping weekends? Spec doesn't strictly say, but usually M-F in practicums. 
        // For MVP, we'll strict add 1 day. Use logic elsewhere to skip weekends if needed)
        return addDays(date, 1);
    } else {
        // Weekly usually means 1 week later
        return addWeeks(date, 1);
    }
}

/**
 * Checks if a log is due (or overdue) based on the last log date.
 * 
 * @param interval 'daily' or 'weekly'
 * @param lastLogDate The date of the last submitted log
 * @param referenceDate The current date to check against (default: now)
 * @returns boolean true if due/overdue
 */
export function isLogDue(interval: LogInterval, lastLogDate: string | Date, referenceDate: Date = new Date()): boolean {
    const nextDue = getNextLogDate(interval, lastLogDate);
    const today = startOfDay(referenceDate);
    const due = startOfDay(nextDue);

    // If today is same as due date or after, it is due.
    return isSameDay(today, due) || isAfter(today, due);
}
