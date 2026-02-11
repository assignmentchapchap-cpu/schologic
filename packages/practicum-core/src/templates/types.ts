
export type TemplateFieldType = 'text' | 'textarea' | 'select' | 'scale' | 'number' | 'date';

export interface BaseTemplateField {
    id: string; // The key used in the JSONB data
    label: string;
    type: TemplateFieldType;
    required: boolean;
    placeholder?: string;
    description?: string;
    defaultValue?: any;
}

export interface SelectTemplateField extends BaseTemplateField {
    type: 'select';
    options: string[];
}

export interface ScaleTemplateField extends BaseTemplateField {
    type: 'scale';
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
}

export interface TextTemplateField extends BaseTemplateField {
    type: 'text' | 'textarea';
}

export interface NumberTemplateField extends BaseTemplateField {
    type: 'number';
    min?: number;
    max?: number;
}

export interface DateTemplateField extends BaseTemplateField {
    type: 'date';
}

export type TemplateField =
    | SelectTemplateField
    | ScaleTemplateField
    | TextTemplateField
    | NumberTemplateField
    | DateTemplateField;

export interface LogTemplate {
    id: string;
    name: string;
    description: string;
    fields: TemplateField[];
}
