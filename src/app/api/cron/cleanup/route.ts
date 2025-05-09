import { NextResponse } from 'next/server';

/**
 * This endpoint is called by Vercel's cron job system daily at midnight
 * It performs cleanup tasks like purging old temporary data
 */
export async function GET() {
  try {
    // Log the execution for tracking
    console.log('Running cleanup cron job at:', new Date().toISOString());
    
    // Add your cleanup logic here
    // For example, you could:
    // 1. Delete old temporary files
    // 2. Archive old logs
    // 3. Purge expired cache entries
    // 4. Clean up old Vercel deployments through their API
    
    // If you want to implement Vercel deployment cleanup logic directly in this endpoint,
    // you can do so with code similar to what's in your GitHub Action
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Cleanup completed successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in cleanup cron job:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Cleanup failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
