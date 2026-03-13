import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, name: true, passwordHash: true, isBanned: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ success: false, error: 'Account has been banned' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET! as jwt.Secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword, token }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
