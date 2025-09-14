import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/db-connection-test';

export async function GET() {
  try {
    const result = await testDatabaseConnection();
    
    if (result.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: result.message 
      });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: result.message,
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database test failed', 
      error: error.message 
    }, { status: 500 });
  }
}