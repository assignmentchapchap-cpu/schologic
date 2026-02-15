import { Metadata } from 'next';
import PricingLayoutClient from './PricingLayoutClient';

export const metadata: Metadata = {
    title: 'Pricing - Schologic LMS',
    description: 'Simple, transparent pricing for Schologic LMS. Free for instructors and non-profits, custom plans for institutions.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <PricingLayoutClient>{children}</PricingLayoutClient>;
}
