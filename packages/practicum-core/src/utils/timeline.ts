import { TimelineConfig, TimelineEvent, TimelineWeek } from '../types/timeline';
import { v4 as uuidv4 } from 'uuid';

export const generateTimeline = (
    startDate: string,
    endDate: string,
    logInterval: 'daily' | 'weekly' | 'biweekly' = 'weekly',
    cohortTitle: string
): TimelineConfig => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weeks: TimelineWeek[] = [];
    const events: TimelineEvent[] = [];

    // 1. Generate Weeks (Monday Aligned)
    const getMonday = (d: Date) => {
        const d2 = new Date(d);
        const day = d2.getDay();
        const diff = d2.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d2.setDate(diff));
    };

    let currentWeekStart = new Date(start);
    // Align to Monday if start is not Monday
    if (currentWeekStart.getDay() !== 1) {
        currentWeekStart = getMonday(currentWeekStart);
    }
    // Ensure we strip time component to avoid drift
    currentWeekStart.setHours(0, 0, 0, 0);

    let weekCount = 1;

    // Use a slightly extended end date to ensure we cover the final partial week if needed
    const endBuffer = new Date(end);
    endBuffer.setDate(endBuffer.getDate() + 3); // Buffer to catch mid-week ends

    while (currentWeekStart < endBuffer) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6); // Sunday
        weekEnd.setHours(23, 59, 59, 999);

        weeks.push({
            week_number: weekCount,
            start_date: currentWeekStart.toISOString(),
            end_date: weekEnd.toISOString(),
            label: `Week ${weekCount}`
        });

        // Advance to next Monday
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekCount++;
    }

    const ensureWeekday = (dateInput: string | Date): string => {
        const d = new Date(dateInput);
        const day = d.getDay();
        if (day === 0) { // Sunday -> Monday
            d.setDate(d.getDate() + 1);
        } else if (day === 6) { // Saturday -> Friday
            d.setDate(d.getDate() - 1);
        }
        return d.toISOString();
    };

    // 2. Default Events

    // Start Date
    events.push({
        id: uuidv4(),
        title: 'Reporting Date',
        date: ensureWeekday(startDate),
        type: 'milestone',
        description: 'First day of practicum placement',
        is_system: true
    });

    // End Date
    events.push({
        id: uuidv4(),
        title: 'Practicum Ends',
        date: ensureWeekday(endDate),
        type: 'milestone',
        description: 'Last day of practicum placement',
        is_system: true
    });

    // Field Visit (Halfway point)
    const midTime = start.getTime() + (end.getTime() - start.getTime()) / 2;
    const fieldVisitDate = new Date(midTime);
    fieldVisitDate.setHours(0, 0, 0, 0); // Normalize to start of day to avoid partial matches
    events.push({
        id: uuidv4(),
        title: 'Field Visit',
        date: ensureWeekday(fieldVisitDate),
        type: 'meeting',
        description: 'Supervisor field assessment visit',
        is_system: true
    });

    // Log Submissions (Every Friday by default)
    if (logInterval === 'weekly') {
        weeks.forEach(week => {
            const weekEnd = new Date(week.end_date);
            // Check if deadline is after end date match
            if (weekEnd > end) return;

            // Logs due on Week End, but ensure weekday (Sat->Fri, Sun->Mon) -> Actually usually Logs are due Friday or Sunday night.
            // If user wants NO events on weekends, assuming Friday is safer for "Due Date".
            // My ensureWeekday function maps Sat->Fri, Sun->Mon.
            // Let's force Logs to be checked against weekend logic. 
            // If calculated date is Sat, it becomes Fri. If Sun, it becomes Mon.
            // But if Start was Monday, Week End is Sunday (day 6 of 0-6 or 1-7?).
            // weekEnd generation: current + 6 days.

            events.push({
                id: uuidv4(),
                title: `Week ${week.week_number} Log Due`,
                date: ensureWeekday(week.end_date),
                type: 'log',
                description: `Log submission for Week ${week.week_number}`,
                is_system: true
            });
        });
    }

    // Supervisor Report (End + 7 days)
    const supervisorDate = new Date(end);
    supervisorDate.setDate(supervisorDate.getDate() + 7);
    events.push({
        id: uuidv4(),
        title: 'Supervisor Report Due',
        date: ensureWeekday(supervisorDate),
        type: 'report',
        description: 'Deadline for supervisor verification and assessment',
        is_system: true
    });

    // Student Final Report (End + 30 days)
    const reportDate = new Date(end);
    reportDate.setDate(reportDate.getDate() + 30);
    events.push({
        id: uuidv4(),
        title: 'Final Student Report Due',
        date: ensureWeekday(reportDate),
        type: 'report',
        description: 'Deadline for final academic report submission',
        is_system: true
    });

    return {
        weeks,
        events,
        settings: {
            log_deadline_day: 5,
            report_offset_days: 30,
            supervisor_offset_days: 7
        }
    };
};
