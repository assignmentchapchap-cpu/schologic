interface BackgroundGridProps {
    variant?: 'default' | 'amber';
}

export function BackgroundGrid({ variant = 'default' }: BackgroundGridProps) {
    const gridColor = variant === 'amber' ? 'rgba(245, 158, 11' : 'rgba(148, 163, 184';
    const fadeFrom = variant === 'amber' ? 'from-white' : 'from-slate-50';

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Base Grid - Lighter and clearer */}
            <div
                className="absolute inset-0 opacity-[0.3]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${gridColor}, 0.2) 1px, transparent 1px),
                        linear-gradient(to bottom, ${gridColor}, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Major Grid Lines - Every 5th line or larger spacing for "futuristic" feel */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, ${gridColor}, 0.4) 1px, transparent 1px),
                        linear-gradient(to bottom, ${gridColor}, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top Fade - Ensure content is readable near top */}
            <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${fadeFrom} to-transparent`} />
        </div>
    );
}
