import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    // Ambil token dari header Authorization (dikirim oleh apiFetch)
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy GET /user/profile error:', error);
    return NextResponse.json(
      { message: 'Gagal menghubungi server backend' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy PUT /user/profile error:', error);
    return NextResponse.json(
      { message: 'Gagal menghubungi server backend' },
      { status: 500 }
    );
  }
}