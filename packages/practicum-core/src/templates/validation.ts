import { LogTemplate, TemplateField } from './types';

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

/**
 * Validates a log entry object against a Log Template definition.
 * Checks for required fields and basic type correctness.
 * 
 * @param entry The key-value data of the log entry
 * @param template The LogTemplate definition
 * @returns ValidationResult with valid boolean and error map
 */
export function validateLogAgainstTemplate(entry: Record<string, any>, template: LogTemplate): ValidationResult {
    const errors: Record<string, string> = {};

    for (const field of template.fields) {
        const value = entry[field.id];

        // 1. Check Required
        if (field.required) {
            if (value === undefined || value === null || value === '') {
                errors[field.id] = `${field.label} is required`;
                continue;
            }
        }

        // Skip further checks if optional and empty
        if (value === undefined || value === null || value === '') {
            continue;
        }

        // 2. Check Type (Basic)
        switch (field.type) {
            case 'number':
            case 'scale':
                if (typeof value !== 'number' || isNaN(value)) {
                    // Allow string numbers if they parse correctly? strictly enforce types for now or be lenient?
                    // The prompt implies validation logic. Let's start strict but safe.
                    errors[field.id] = `${field.label} must be a number`;
                } else {
                    // Scale Range Check
                    if (field.type === 'scale') {
                        if (value < field.min || value > field.max) {
                            errors[field.id] = `${field.label} must be between ${field.min} and ${field.max}`;
                        }
                    }
                    // Number limits
                    if (field.type === 'number') {
                        if (field.min !== undefined && value < field.min) {
                            errors[field.id] = `${field.label} must be at least ${field.min}`;
                        }
                        if (field.max !== undefined && value > field.max) {
                            errors[field.id] = `${field.label} must be at most ${field.max}`;
                        }
                    }
                }
                break;

            case 'select':
                if (!field.options.includes(value)) {
                    errors[field.id] = `${field.label} must be one of the valid options`;
                }
                break;

            // text, textarea, date are usually strings, assumed valid if present
        }
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors
    };
}
