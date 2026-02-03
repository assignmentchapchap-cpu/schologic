import { LogTemplate } from './types';

export const TEACHING_PRACTICE_TEMPLATE: LogTemplate = {
    id: 'teaching_practice',
    name: 'Teaching Practice',
    description: 'Standard log for student teachers tracking classes and observations.',
    fields: [
        {
            id: 'office_activities',
            label: 'Office / Administration Activities',
            type: 'textarea',
            required: false,
            placeholder: 'e.g., Staff meeting, preparing exams...'
        },
        {
            id: 'class_taught',
            label: 'Class Taught',
            type: 'text',
            required: true,
            placeholder: 'e.g., Form 3B'
        },
        {
            id: 'subject_taught',
            label: 'Subject',
            type: 'text',
            required: true,
            placeholder: 'e.g., Mathematics'
        },
        {
            id: 'lesson_topic',
            label: 'Topic / Sub-topic',
            type: 'text',
            required: true
        },
        {
            id: 'observations',
            label: 'Self-Observation / Remarks',
            type: 'textarea',
            required: true,
            description: 'Reflect on lesson delivery, student engagement, or challenges.'
        },
        {
            id: 'supervisor_notes',
            label: 'Cooperating Teacher Notes',
            type: 'textarea',
            required: false
        }
    ]
};

export const INDUSTRIAL_ATTACHMENT_TEMPLATE: LogTemplate = {
    id: 'industrial_attachment',
    name: 'Industrial Attachment',
    description: 'Standard log for workplace attachment tracking tasks and skills.',
    fields: [
        {
            id: 'department',
            label: 'Department / Section',
            type: 'text',
            required: true,
            placeholder: 'e.g., IT Support, Accounting...'
        },
        {
            id: 'tasks_performed',
            label: 'Tasks Performed',
            type: 'textarea',
            required: true,
            description: 'List the main activities you undertook today.'
        },
        {
            id: 'skills_acquired',
            label: 'New Skills / Knowledge Acquired',
            type: 'textarea',
            required: true
        },
        {
            id: 'challenges',
            label: 'Challenges Encountered',
            type: 'textarea',
            required: false
        }
    ]
};
