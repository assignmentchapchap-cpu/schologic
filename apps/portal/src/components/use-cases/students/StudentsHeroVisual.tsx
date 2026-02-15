import React from 'react';

export const StudentsHeroVisual = () => {
    return (
        <svg
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            role="img"
            aria-label="Abstract connection visualization for student learning network"
            data-nosnippet
        >
            {/* Connective Lines (Slate/Structure) */}
            <path d="M50 50 L350 350" stroke="#0f172a" strokeWidth="2" strokeOpacity="0.1" />
            <path d="M350 50 L50 350" stroke="#0f172a" strokeWidth="2" strokeOpacity="0.1" />
            <path d="M200 50 L200 350" stroke="#0f172a" strokeWidth="2" strokeOpacity="0.2" />
            <path d="M50 200 L350 200" stroke="#0f172a" strokeWidth="2" strokeOpacity="0.2" />

            {/* Orbit Rings (Purple Theme) */}
            <circle cx="200" cy="200" r="100" stroke="#9333ea" strokeWidth="1.5" strokeOpacity="0.4" />
            <circle cx="200" cy="200" r="60" stroke="#0f172a" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="200" cy="200" r="140" stroke="#9333ea" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="8 8" />

            {/* Nodes (Digital Connection Points) */}
            {/* Central Hub */}
            <circle cx="200" cy="200" r="12" fill="#9333ea" />
            <circle cx="200" cy="200" r="24" stroke="#9333ea" strokeWidth="2" strokeOpacity="0.5" />

            {/* Satellite Nodes */}
            <circle cx="100" cy="100" r="8" fill="#0f172a" />
            <circle cx="300" cy="300" r="8" fill="#0f172a" />
            <circle cx="300" cy="100" r="8" fill="#0f172a" />
            <circle cx="100" cy="300" r="8" fill="#0f172a" />

            {/* Mid-point Nodes - Purple */}
            <circle cx="200" cy="60" r="6" fill="#9333ea" fillOpacity="0.8" />
            <circle cx="200" cy="340" r="6" fill="#9333ea" fillOpacity="0.8" />
            <circle cx="60" cy="200" r="6" fill="#9333ea" fillOpacity="0.8" />
            <circle cx="340" cy="200" r="6" fill="#9333ea" fillOpacity="0.8" />

            {/* Dynamic Elements */}
            <circle cx="130" cy="130" r="4" fill="#0f172a" fillOpacity="0.5" />
            <circle cx="270" cy="270" r="4" fill="#0f172a" fillOpacity="0.5" />
        </svg>
    );
};
