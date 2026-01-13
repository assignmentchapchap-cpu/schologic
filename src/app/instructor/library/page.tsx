import LibraryView from '@/components/library/LibraryView';
import { Metadata } from 'next';
import { getAssets } from '@/app/actions/library';

export const metadata: Metadata = {
    title: 'Library | Schologic Instructor',
};

export default async function LibraryPage() {
    const assets = await getAssets();
    return <LibraryView initialAssets={assets} />;
}
