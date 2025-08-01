// app/api/test/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.ASTROLOGICO_API_KEY;

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasApiKey: !!API_KEY,
    apiKeyLength: API_KEY ? API_KEY.length : 0,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}