import { BrandingConfig } from "./types";

/** Template B: "The Centered Institutional Card" — primary bg, white card, logo on card */
export function LoginTemplateCentered({ config }: { config: BrandingConfig }) {
    const { primary_color, secondary_color, logo_url, logo_size, text_overrides } = config;

    return (
        <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: primary_color, fontFamily: "'Inter', sans-serif" }}
        >
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, ${secondary_color} 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
            }} />

            {/* Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {logo_url && (
                    <div className="flex justify-center mb-5">
                        <img src={logo_url} alt="Logo" style={{ height: `${logo_size}px`, maxWidth: '240px', objectFit: 'contain' }} />
                    </div>
                )}
                <div className="text-center mb-6">
                    <h1 className="text-lg font-bold" style={{ color: secondary_color }}>{text_overrides.heading}</h1>
                    <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{text_overrides.subtext}</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>{text_overrides.id_label}</label>
                        <div className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>{text_overrides.password_label}</label>
                        <div className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50" />
                    </div>
                    <button
                        className="w-full h-10 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: primary_color }}
                    >
                        {text_overrides.button_text}
                    </button>
                </div>
                <p className="text-center text-xs mt-5" style={{ color: '#94a3b8' }}>
                    Powered by <span className="font-semibold" style={{ color: primary_color }}>{config.institution_name || 'Schologic'}</span>
                </p>
            </div>
        </div>
    );
}
