// Shared types for all login templates
export interface BrandingConfig {
    subdomain: string;
    use_custom_domain: boolean;
    custom_domain: string;
    logo_url: string;
    logo_size: number;
    logo_has_transparency: boolean;
    primary_color: string;
    secondary_color: string;
    template: "split" | "centered" | "minimal";
    hero_image_url: string;
    text_overrides: {
        heading: string;
        subtext: string;
        id_label: string;
        password_label: string;
        button_text: string;
    };
    institution_name?: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
    subdomain: "",
    use_custom_domain: false,
    custom_domain: "",
    logo_url: "",
    logo_size: 80,
    logo_has_transparency: false,
    primary_color: "#4f46e5",
    secondary_color: "#0f172a",
    template: "centered",
    hero_image_url: "",
    text_overrides: {
        heading: "Welcome to Schologic LMS",
        subtext: "Please sign in to continue",
        id_label: "Email Address",
        password_label: "Password",
        button_text: "Sign In",
    },
};
