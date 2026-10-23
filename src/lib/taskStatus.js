import { differenceInHours, isToday, formatDistanceToNowStrict } from 'date-fns';
import { id } from 'date-fns/locale';

export function getStatus(task) {
    if (task.done) return 'done';
    const d = new Date(task.deadline);
    if (d < new Date()) return 'overdue';
    if (isToday(d)) return 'today';
    return 'upcoming';
}

export function countdown(task) {
    const d = new Date(task.deadline);
    const dist = formatDistanceToNowStrict(d, { locale: id });
    return d < new Date() ? `overdue by ${dist}` : `${dist} left`;
}