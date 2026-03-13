import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await verifyJWT();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const count = await prisma.wishlist.count({ 
      where: { userId: user.id } 
    });
    
    return NextResponse.json({ success: true, data: { count } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
