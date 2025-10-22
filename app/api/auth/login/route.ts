import { NextRequest, NextResponse } from 'next/server';

// Credenziali admin (in produzione, usare variabili d'ambiente)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'concorso2025';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Genera un semplice token di sessione
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      return NextResponse.json({
        success: true,
        token: sessionToken,
        message: 'Login effettuato con successo',
      });
    }

    return NextResponse.json(
      { error: 'Credenziali non valide' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Errore durante il login:', error);
    return NextResponse.json(
      { error: 'Errore durante il login' },
      { status: 500 }
    );
  }
}
