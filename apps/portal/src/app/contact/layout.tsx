import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us - Schologic LMS',
    description: 'Get in touch with the Schologic team for inquiries, support, or pricing.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
