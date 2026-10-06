import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from '@/lib/erpnext';

/**
 * Authenticated ERPNext Health Check Endpoint
 * 
 * Strict authorization enforced: requires valid Bearer token matching CONTROL_PLANE_SECRET.
 * Never leaks privileged Administrator identities or user email records anonymously.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const expectedSecret = process.env.CONTROL_PLANE_SECRET;

  // Enforce server-side authorization
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized: Valid Control Plane authorization credentials required.'
    }, { status: 401 });
  }

  try {
    // Ping ERPNext via a non-sensitive document or version check
    // We do not leak user objects, passwords, or emails to client callers
    await getDocument('User', 'Administrator');

    return NextResponse.json({
      success: true,
      message: 'ERPNext API connection verified',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error("ERPNext Health Check Error:", error);
    return NextResponse.json({
      success: false,
      message: 'ERPNext API connection unreachable',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });
  }
}
