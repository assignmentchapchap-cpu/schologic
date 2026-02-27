import { BrandingConfig } from "./types";

/** Template A: "The Modern Split" — hero image left, form right */
export function LoginTemplateSplit({ config }: { config: BrandingConfig }) {
    const { primary_color, secondary_color, logo_url, logo_size, hero_image_url, text_overrides } = config;

    return (
        <div className="w-full h-full flex" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Left: Hero Image */}
            <div className="w-1/2 relative overflow-hidden" style={{ backgroundColor: secondary_color }}>
                {hero_image_url ? (
                    <img src={hero_image_url} alt="Campus" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center opacity-30">
                            <svg className="w-16 h-16 mx-auto mb-3" style={{ color: primary_color }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                            </svg>
                            <p className="text-sm font-medium" style={{ color: primary_color }}>Upload a campus photo</p>
                        </div>
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            </div>

            {/* Right: Login Form */}
            <div className="w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: '#ffffff' }}>
                <div className="w-full max-w-sm space-y-6">
                    {logo_url && (
                        <div className="flex justify-center mb-2">
                            <img src={logo_url} alt="Logo" style={{ height: `${logo_size}px`, maxWidth: '240px', objectFit: 'contain' }} />
                        </div>
                    )}
                    <div className="text-center">
                        <h1 className="text-xl font-bold" style={{ color: secondary_color }}>{text_overrides.heading}</h1>
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
                    <p className="text-center text-sm">
                        <a href="#" className="font-semibold hover:underline transition-opacity" style={{ color: primary_color }}>
                            Forgot Password?
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
