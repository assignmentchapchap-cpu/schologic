import ClientSubmission from './ClientSubmission';

export default async function SubmissionReportPage({ params }: { params: Promise<{ submissionId: string }> }) {
    const { submissionId } = await params;
    return <ClientSubmission submissionId={submissionId} />;
}
