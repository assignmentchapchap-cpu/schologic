/**
 * JSON-LD Structured Data Components for SEO
 * 
 * Renders schema.org structured data as <script type="application/ld+json"> blocks.
 * Used across use-case pages for FAQPage, Organization, and SoftwareApplication schemas.
 */

interface FAQItem {
    question: string;
    answer: string;
}

interface JsonLdFAQPageProps {
    items: FAQItem[];
}

/**
 * Renders FAQPage schema markup from an array of question/answer pairs.
 * Place this component inside your page's JSX — it outputs an invisible <script> tag.
 */
export function JsonLdFAQPage({ items }: JsonLdFAQPageProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Renders Organization schema markup for Schologic.
 * Should be placed once in the root layout or a shared component.
 */
export function JsonLdOrganization() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://schologic.com/#organization",
        name: "Schologic",
        url: "https://schologic.com",
        logo: "https://schologic.com/logo.png",
        description:
            "Schologic is an education technology company building the operating system for academic integrity and digital learning in Africa. Our platform serves universities, colleges, and TVET institutions with AI content detection, automated grading, practicum management, and open educational resources.",
        areaServed: {
            "@type": "Country",
            name: "Kenya",
        },
        sameAs: [
            "https://www.linkedin.com/company/schologic",
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

/**
 * Renders SoftwareApplication schema markup for Schologic LMS.
 * Best placed on the overview/use-cases page.
 */
export function JsonLdSoftwareApplication() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Schologic LMS",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: "https://schologic.com",
        description:
            "Cut grading time by 80%, eliminate textbook costs, and protect academic integrity — without switching between five different tools. Schologic LMS unifies AI grading, content detection, class management, and open educational resources into one platform designed for African universities and colleges.",
        provider: {
            "@type": "Organization",
            "@id": "https://schologic.com/#organization",
            name: "Schologic",
        },
        featureList: [
            "AI Teaching Assistant with rubric-based grading",
            "Academic integrity and AI content detection",
            "Zero Textbook Cost OER integration",
            "Digital practicum and attachment logbooks",
            "Multi-campus Role-Based Access Control",
            "Student retention analytics dashboard",
            "CDACC compliance reporting for TVET",
            "CUE-aligned assessment standards"
        ],
        audience: {
            "@type": "EducationalAudience",
            educationalRole: "instructor",
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
