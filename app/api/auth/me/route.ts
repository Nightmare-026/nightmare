import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
  try {
    const user = await verifyJWT();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
