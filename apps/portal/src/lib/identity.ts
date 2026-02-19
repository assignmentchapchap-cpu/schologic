/**
 * Utility for mapping internal role names to professional display labels.
 */
export const ROLE_LABELS: Record<string, string> = {
    'superadmin': 'Platform Admin',
    'instructor': 'Instructor',
    'student': 'Student',
};

/**
 * Returns a professional display label for a given role string.
 * Falls back to Capitalized role if no mapping exists.
 */
export function getRoleLabel(role: string | null | undefined): string {
    if (!role) return 'User';

    const normalizedRole = role.toLowerCase();
    return ROLE_LABELS[normalizedRole] || role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Returns a role-appropriate "Waiting for X" message for students.
 */
export function getWaitingMessage(role: string | null | undefined): string {
    const label = getRoleLabel(role);
    if (label === 'Platform Admin') return "Waiting for admin's response...";
    if (label === 'Instructor') return "Waiting for instructor's response...";
    return "Waiting for response...";
}
