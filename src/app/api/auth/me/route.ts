import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('turnero_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, usuario: null });
    }

    const payload = await AuthService.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, usuario: null });
    }

    return NextResponse.json({
      authenticated: true,
      usuario: payload,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, usuario: null });
  }
}
