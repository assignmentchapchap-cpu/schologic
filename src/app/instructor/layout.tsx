import Sidebar from '@/components/Sidebar';

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar role="instructor" />
            <div className="md:ml-64 min-h-screen transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
