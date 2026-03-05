import { NextResponse } from 'next/server';
import { getSuperadminId } from '../../actions/pilotMessaging';

export async function GET() {
    console.log('[TestSuperadmin] Calling getSuperadminId()...');
    const result = await getSuperadminId();
    console.log('[TestSuperadmin] Result:', result);
    return NextResponse.json(result);
}
