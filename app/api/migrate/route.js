import { NextResponse } from 'next/server';
import { migrateToMongoDB } from '@/lib/db-operations';

export async function POST(request) {
  try {
    console.log('Starting MongoDB migration...');
    const result = await migrateToMongoDB();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully migrated data to MongoDB' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
