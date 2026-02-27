import { BrandingConfig } from "./types";

/** Template C: "The Minimalist Portal" — light bg, centered logo, floating inputs */
export function LoginTemplateMinimal({ config }: { config: BrandingConfig }) {
    const { primary_color, secondary_color, logo_url, logo_size, text_overrides } = config;

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}
        >
            {logo_url && (
                <div className="mb-6">
                    <img src={logo_url} alt="Logo" style={{ height: `${logo_size}px`, maxWidth: '240px', objectFit: 'contain' }} />
                </div>
            )}
            <div className="text-center mb-8">
                <h1 className="text-xl font-bold" style={{ color: secondary_color }}>{text_overrides.heading}</h1>
                <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{text_overrides.subtext}</p>
            </div>
            <div className="w-full max-w-xs space-y-4">
                <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>{text_overrides.id_label}</label>
                    <div className="w-full h-11 rounded-xl border border-gray-200 bg-white shadow-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>{text_overrides.password_label}</label>
                    <div className="w-full h-11 rounded-xl border border-gray-200 bg-white shadow-sm" />
                </div>
                <button
                    className="w-full h-11 rounded-xl text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primary_color }}
                >
                    {text_overrides.button_text}
                </button>
            </div>
            <p className="text-center text-xs mt-8" style={{ color: '#cbd5e1' }}>
                Powered by <span className="font-semibold" style={{ color: primary_color }}>{config.institution_name || 'Schologic'}</span>
            </p>
        </div>
    );
}
