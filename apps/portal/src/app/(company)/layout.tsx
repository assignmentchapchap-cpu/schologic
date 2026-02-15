import CompanyLayoutClient from './CompanyLayoutClient';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
    return <CompanyLayoutClient>{children}</CompanyLayoutClient>;
}
