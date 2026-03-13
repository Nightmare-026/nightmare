import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user || !DEVELOPER_EMAIL || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { feedbackId, replyMessage } = await request.json();
    if (!feedbackId || !replyMessage?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing feedbackId or replyMessage' }, { status: 400 });
    }

    const feedback = await prisma.siteFeedback.findUnique({ 
      where: { id: feedbackId } 
    });
    
    if (!feedback || !feedback.email) {
      return NextResponse.json({ success: false, error: 'Feedback not found or no email' }, { status: 404 });
    }

    if (!resend) {
      return NextResponse.json({ success: false, error: 'Email service not configured' }, { status: 500 });
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Nightmare <noreply@nightmare-edu.com>',
      to: feedback.email,
      subject: 'Reply to your feedback — Nightmare',
      html: `
        <div style="font-family:sans-serif;padding:20px;max-width:600px;margin:auto;">
          <h2 style="color:#7c3aed;">Reply from Nightmare Team</h2>
          <p>Thank you for your feedback. Here is our response:</p>
          <div style="background:#f4f4f4;padding:15px;border-left:4px solid #7c3aed;border-radius:4px;margin:20px 0;">
            <p style="white-space:pre-wrap;">${replyMessage}</p>
          </div>
          <p style="color:#888;font-size:13px;">Your original feedback: "${feedback.message || '(no message)'}"</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: 'Reply sent' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
