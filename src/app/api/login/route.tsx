import { NextResponse } from 'next/server';
import axios from 'axios';
import { type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const response = await axios.post('https://khanut.onrender.com/api/auth/login', {
      email,
      password
    });

    const { accessToken, refreshToken, role, userId } = response.data;

    const res = NextResponse.json({
      success: true,
      user: {
        id: userId,
        role: role
      }
    });

    
    res.cookies.set({
      name: 'access-token',
      value: accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 3,
      path: '/',
      sameSite: 'lax'
    });

    // Set client-readable token (less secure)
    res.cookies.set({
      name: 'client-token',
      value: accessToken, // Same token for demo - in production use a limited-scope token
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 3,
      path: '/',
      sameSite: 'lax'
    });

    res.cookies.set({
      name: 'user-role',
      value: role,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax'
    });

    return res;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { success: false, message: error.response?.data?.message || 'Login failed' },
        { status: error.response?.status || 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}