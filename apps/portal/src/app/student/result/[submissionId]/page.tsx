import ClientResult from './ClientResult';

export default async function StudentResultPage({ params }: { params: Promise<{ submissionId: string }> }) {
    const { submissionId } = await params;
    return <ClientResult submissionId={submissionId} />;
}
