import { NextResponse } from 'next/server';
import { getDocument, callMethod } from '@/lib/erpnext';

export async function GET() {
  try {
    // 1. Example: Fetching the Administrator user to verify connection
    const adminUser = await getDocument('User', 'Administrator');
    
    // 2. Example: Triggering a custom provisioning script (mock)
    // const provisionResult = await callMethod('sees_core.api.provision_tenant', { 
    //   tenant_id: 'tenant_123', 
    //   tier: 'growth' 
    // });

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to ERPNext API',
      data: {
        user: adminUser.name,
        email: adminUser.email,
        // result: provisionResult
      }
    });

  } catch (error: any) {
    console.error("ERPNext Connection Error:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to ERPNext API',
      error: error.message
    }, { status: 500 });
  }
}
